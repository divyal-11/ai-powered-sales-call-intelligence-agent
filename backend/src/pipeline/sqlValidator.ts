import { Parser } from "node-sql-parser";
const parser = new Parser();

export interface ValidationResult {
  isValid: boolean;
  sanitizedSql?: string;
  error?: string;
}
const ALLOWED_TABLE = "call_intelligence_view";
const MAX_LIMIT = 50;

export function validateAndSanitizeSql(
  rawSql: string
): ValidationResult {
    try {
        let cleanSql = rawSql
      .replace(/^```sql\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/g, "")
      .trim();

      //remove semicolons
      if(cleanSql.endsWith(";")){
        cleanSql = cleanSql.slice(0, -1).trim();
      }

      //check for multi statement semicolons
      if(cleanSql.includes(";")){
        return {
          isValid: false,
          error: "Multiple SQL statements are not allowed.",
        };
      }

      //parse ast for postgres
      const parsed = parser.parse(cleanSql,{
        database: "PostgreSQL"
      });

      const astArray = Array.isArray(parsed.ast) ? parsed.ast : [parsed.ast];

      //must be exactly  one statement
      if(astArray.length !==1){
        return {
          isValid: false,
          error: "Only a single SQL statement is allowed."
        }
      }



      const ast = astArray[0];

      //must be select statement
      if (!ast || ast.type !== "select") {
      return {
        isValid: false,
        error: `Prohibited SQL statement type: '${ast?.type || "unknown"}'. Only SELECT statements are permitted.`,
      };
    }

    //verify from clause targets only call_intelligence_view
    const fromClause = (ast as any).from;
    if((!fromClause || !Array.isArray(fromClause) || fromClause.length === 0)){
      return {
        isValid: false,
        error: "Query must specify a FROM clause targeting 'call_intelligence_view'.",
      };
    }

    for (const tableEntry of fromClause) {
      const tableName = tableEntry.table?.toLowerCase();
      if (tableName !== ALLOWED_TABLE) {
        return {
          isValid: false,
          error: `Access denied to table '${tableName}'. Only '${ALLOWED_TABLE}' is accessible.`,
        };
      }
    }

    //enfore limit<=50
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

    //re serialise sanitised ast
    const sanitized = parser.sqlify(
      selectAst,
      { database: "PostgresQL" }
    );

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


  