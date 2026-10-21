import { Parser } from "node-sql-parser";
const parser = new Parser();

export interface ValidationResult {
  isValid: boolean;
  sanitizedSql?: string;
  error?: string;
}

const ALLOWED_TABLE = "call_intelligence_view";
const MAX_LIMIT = 50;

// Function Allowlist (strictly allowed functions; everything else rejected)
const ALLOWED_FUNCTIONS = new Set([
  "count",
  "sum",
  "avg",
  "min",
  "max",
  "lower",
  "upper",
  "coalesce",
  "round",
  "date_trunc",
]);

/**
 * Recursively walks the AST to enforce:
 * 1. Allowlist-only tables (call_intelligence_view)
 * 2. Complete rejection of subqueries (in columns, where, having, etc.)
 * 3. Complete rejection of SET operations (UNION, INTERSECT, EXCEPT)
 * 4. Strict function allowlist (blocks pg_sleep, pg_read_file, version, etc.)
 */
function walkAndValidateAst(node: any, isRoot = false): void {
  if (!node || typeof node !== "object") return;

  // 1. Array traversal
  if (Array.isArray(node)) {
    for (const item of node) {
      walkAndValidateAst(item, false);
    }
    return;
  }

  // 2. Reject set operations (UNION, INTERSECT, EXCEPT)
  if (node._next || node.set_op) {
    throw new Error("UNION and set operations are prohibited.");
  }

  // 3. Reject subqueries anywhere in the tree (except the root SELECT)
  if (!isRoot) {
    if (node.ast && typeof node.ast === "object") {
      throw new Error("Subqueries are prohibited.");
    }
    if (node.type === "select") {
      throw new Error("Subqueries are prohibited.");
    }
  }

  // 4. Function Allowlist Check (handles aggr_func and regular function calls)
  if (node.type === "aggr_func" || node.type === "function") {
    let funcName = "";
    if (typeof node.name === "string") {
      funcName = node.name;
    } else if (node.name?.name && Array.isArray(node.name.name)) {
      funcName = node.name.name.map((n: any) => n.value).join(".");
    } else if (typeof node.name?.value === "string") {
      funcName = node.name.value;
    }

    funcName = funcName.toLowerCase().trim();
    if (!ALLOWED_FUNCTIONS.has(funcName)) {
      throw new Error(`Prohibited function: Function '${funcName}' is not permitted.`);
    }
  }

  // 5. Table Scoping Check
  if (node.table && typeof node.table === "string") {
    const tableName = node.table.toLowerCase().trim();
    if (tableName !== ALLOWED_TABLE) {
      throw new Error(`Access denied to table '${tableName}'. Only '${ALLOWED_TABLE}' is accessible.`);
    }
  }

  // 6. Recursively walk all properties (columns, where, having, groupby, orderby, joins)
  for (const [key, value] of Object.entries(node)) {
    // Avoid re-checking circular parent references if any
    if (key === "parent") continue;
    walkAndValidateAst(value, false);
  }
}

export function validateAndSanitizeSql(rawSql: string): ValidationResult {
  try {
    let cleanSql = rawSql
      .replace(/^```sql\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/g, "")
      .trim();

    // Strip trailing semicolon
    if (cleanSql.endsWith(";")) {
      cleanSql = cleanSql.slice(0, -1).trim();
    }

    // Check for multi-statement semicolons
    if (cleanSql.includes(";")) {
      return {
        isValid: false,
        error: "Multiple SQL statements are not allowed.",
      };
    }

    // Parse AST for PostgreSQL
    const parsed = parser.parse(cleanSql, {
      database: "PostgreSQL",
    });

    const astArray = Array.isArray(parsed.ast) ? parsed.ast : [parsed.ast];

    // Must be exactly one statement
    if (astArray.length !== 1) {
      return {
        isValid: false,
        error: "Only a single SQL statement is allowed.",
      };
    }

    const ast = astArray[0];

    // Must be a SELECT statement
    if (!ast || ast.type !== "select") {
      return {
        isValid: false,
        error: `Prohibited SQL statement type: '${ast?.type || "unknown"}'. Only SELECT statements are permitted.`,
      };
    }

    // Prohibit CTEs (WITH queries)
    if ((ast as any).with) {
      return {
        isValid: false,
        error: "WITH queries (CTEs) are prohibited.",
      };
    }

    // Must have a FROM clause
    const fromClause = (ast as any).from;
    if (!fromClause || !Array.isArray(fromClause) || fromClause.length === 0) {
      return {
        isValid: false,
        error: `Query must specify a FROM clause targeting '${ALLOWED_TABLE}'.`,
      };
    }

    // Verify all tables in FROM clause match ALLOWED_TABLE
    for (const tableEntry of fromClause) {
      const tableName = tableEntry.table?.toLowerCase();
      if (tableName !== ALLOWED_TABLE) {
        return {
          isValid: false,
          error: `Access denied to table '${tableName}'. Only '${ALLOWED_TABLE}' is accessible.`,
        };
      }
    }

    // Comprehensive recursive AST walk (rejects subqueries, UNIONs, unallowed functions, other tables)
    walkAndValidateAst(ast, true);

    // Enforce LIMIT <= 50
    const selectAst = ast as any;
    if (
      !selectAst.limit ||
      !Array.isArray(selectAst.limit.value) ||
      selectAst.limit.value.length === 0
    ) {
      selectAst.limit = {
        seperator: "",
        value: [{ type: "number", value: MAX_LIMIT }],
      };
    } else {
      const limitVal = selectAst.limit.value?.[0]?.value;
      if (typeof limitVal === "number" && limitVal > MAX_LIMIT) {
        selectAst.limit.value[0].value = MAX_LIMIT;
      }
    }

    // Re-serialize sanitized AST
    const sanitized = parser.sqlify(selectAst, { database: "PostgresQL" });

    return {
      isValid: true,
      sanitizedSql: sanitized,
    };
  } catch (err) {
    return {
      isValid: false,
      error: `Invalid SQL syntax: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}