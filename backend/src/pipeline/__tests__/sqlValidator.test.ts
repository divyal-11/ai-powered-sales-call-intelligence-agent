import { describe, it, expect } from "vitest";
import { validateAndSanitizeSql } from "../sqlValidator";

describe("sqlValidator - AST Security Guardrail", () => {
  it("should accept a valid SELECT query on call_intelligence_view", () => {
    const rawSql = "SELECT company, lead_score FROM call_intelligence_view WHERE lead_score >= 70";
    const result = validateAndSanitizeSql(rawSql);

    expect(result.isValid).toBe(true);
    expect(result.sanitizedSql).toBeDefined();
    expect(result.sanitizedSql?.toLowerCase()).toContain("call_intelligence_view");
    expect(result.sanitizedSql?.toLowerCase()).toContain("limit 50");
  });

  it("should strip markdown code fences before validation", () => {
    const rawSql = "```sql\nSELECT * FROM call_intelligence_view;\n```";
    const result = validateAndSanitizeSql(rawSql);

    expect(result.isValid).toBe(true);
    expect(result.sanitizedSql).toBeDefined();
  });

  it("should enforce and clamp LIMIT to 50 if user provides a higher limit", () => {
    const rawSql = "SELECT * FROM call_intelligence_view LIMIT 200";
    const result = validateAndSanitizeSql(rawSql);

    expect(result.isValid).toBe(true);
    expect(result.sanitizedSql?.toLowerCase()).toContain("limit 50");
  });

  it("should preserve user LIMIT if it is less than 50", () => {
    const rawSql = "SELECT * FROM call_intelligence_view LIMIT 10";
    const result = validateAndSanitizeSql(rawSql);

    expect(result.isValid).toBe(true);
    expect(result.sanitizedSql?.toLowerCase()).toContain("limit 10");
  });

  it("should block prohibited statement types like DROP TABLE", () => {
    const rawSql = "DROP TABLE call_intelligence_view";
    const result = validateAndSanitizeSql(rawSql);

    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/Only SELECT statements are permitted/i);
  });

  it("should block UPDATE or INSERT statements", () => {
    const rawSql = "UPDATE call_intelligence_view SET lead_score = 100";
    const result = validateAndSanitizeSql(rawSql);

    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/Only SELECT statements are permitted/i);
  });

  it("should block multiple SQL statements separated by semicolons", () => {
    const rawSql = "SELECT * FROM call_intelligence_view; DROP TABLE transcripts;";
    const result = validateAndSanitizeSql(rawSql);

    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/Multiple SQL statements are not allowed/i);
  });

  it("should block queries trying to access tables other than call_intelligence_view", () => {
    const rawSql = "SELECT * FROM transcripts";
    const result = validateAndSanitizeSql(rawSql);

    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/Access denied to table 'transcripts'/i);
  });

  it("should reject malformed or unparseable SQL syntax", () => {
    const rawSql = "SELECT FROM WHERE";
    const result = validateAndSanitizeSql(rawSql);

    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/Invalid SQL syntax/i);
  });

  // Strict Security Checks (Testing current bypasses)
  it("should reject queries with UNION/INTERSECT/EXCEPT", () => {
    const rawSql = "SELECT company FROM call_intelligence_view UNION SELECT company FROM call_intelligence_view";
    const result = validateAndSanitizeSql(rawSql);

    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/UNION|set operations are prohibited/i);
  });

  it("should reject subqueries in the WHERE clause", () => {
    const rawSql = "SELECT * FROM call_intelligence_view WHERE transcript_id IN (SELECT transcript_id FROM call_intelligence_view)";
    const result = validateAndSanitizeSql(rawSql);

    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/Subqueries are prohibited/i);
  });

  it("should reject subqueries in the SELECT column list", () => {
    const rawSql = "SELECT (SELECT company FROM call_intelligence_view LIMIT 1) FROM call_intelligence_view";
    const result = validateAndSanitizeSql(rawSql);

    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/Subqueries are prohibited/i);
  });

  it("should reject dangerous function calls like pg_sleep", () => {
    const rawSql = "SELECT pg_sleep(5) FROM call_intelligence_view";
    const result = validateAndSanitizeSql(rawSql);

    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/Prohibited function|Function 'pg_sleep' is not permitted/i);
  });

  it("should reject dangerous function calls like pg_read_file", () => {
    const rawSql = "SELECT pg_read_file('server.key') FROM call_intelligence_view";
    const result = validateAndSanitizeSql(rawSql);

    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/Prohibited function|Function 'pg_read_file' is not permitted/i);
  });

  it("should reject functions not on the allowlist (e.g. version)", () => {
    const rawSql = "SELECT version() FROM call_intelligence_view";
    const result = validateAndSanitizeSql(rawSql);

    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/Prohibited function|Function 'version' is not permitted/i);
  });

  it("should reject CTE (WITH clause) queries", () => {
    const rawSql = "WITH dangerous_cte AS (SELECT * FROM transcripts) SELECT * FROM dangerous_cte";
    const result = validateAndSanitizeSql(rawSql);

    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/WITH|CTE/i);
  });

  it("should reject CTE masquerading as call_intelligence_view", () => {
    const rawSql = "WITH call_intelligence_view AS (SELECT * FROM transcripts) SELECT * FROM call_intelligence_view";
    const result = validateAndSanitizeSql(rawSql);

    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/WITH queries \(CTEs\) are prohibited/i);
  });

  it("should handle valid comments safely without bypassing validation", () => {
    const rawSql = "SELECT company /* inline comment */ FROM call_intelligence_view -- trailing comment";
    const result = validateAndSanitizeSql(rawSql);

    expect(result.isValid).toBe(true);
    expect(result.sanitizedSql?.toLowerCase()).toContain("call_intelligence_view");
  });

  it("should reject unallowed functions in WHERE clause", () => {
    const rawSql = "SELECT company FROM call_intelligence_view WHERE pg_sleep(1) IS NULL";
    const result = validateAndSanitizeSql(rawSql);

    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/Prohibited function|Function 'pg_sleep' is not permitted/i);
  });

  it("should reject unallowed functions in ORDER BY clause", () => {
    const rawSql = "SELECT company FROM call_intelligence_view ORDER BY pg_sleep(1)";
    const result = validateAndSanitizeSql(rawSql);

    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/Prohibited function|Function 'pg_sleep' is not permitted/i);
  });

  it("should allow legitimate functions from allowlist in WHERE and ORDER BY", () => {
    const rawSql = "SELECT company FROM call_intelligence_view WHERE LOWER(company) = 'prestige' ORDER BY COALESCE(lead_score, 0) DESC";
    const result = validateAndSanitizeSql(rawSql);

    expect(result.isValid).toBe(true);
  });

  it("should reject JOIN to a non-allowed table", () => {
    const rawSql = "SELECT * FROM call_intelligence_view JOIN transcripts ON 1=1";
    const result = validateAndSanitizeSql(rawSql);

    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/Access denied to table 'transcripts'/i);
  });

  it("should reject LEFT JOIN to a non-allowed table", () => {
    const rawSql = "SELECT * FROM call_intelligence_view LEFT JOIN users ON 1=1";
    const result = validateAndSanitizeSql(rawSql);

    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/Access denied to table 'users'/i);
  });

  it("should reject comma joins with non-allowed tables", () => {
    const rawSql = "SELECT * FROM call_intelligence_view, transcripts";
    const result = validateAndSanitizeSql(rawSql);

    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/Access denied to table 'transcripts'/i);
  });

  it("should reject comment tricks attempting to inject UNION", () => {
    const rawSql = "SELECT company FROM call_intelligence_view -- inline comment\nUNION SELECT company FROM call_intelligence_view";
    const result = validateAndSanitizeSql(rawSql);

    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/UNION|set operations are prohibited/i);
  });

  it("should reject comment tricks attempting to mask an unallowed table", () => {
    const rawSql = "SELECT * FROM /* call_intelligence_view */ transcripts";
    const result = validateAndSanitizeSql(rawSql);

    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/Access denied to table 'transcripts'/i);
  });

  it("should reject unallowed functions in HAVING clause", () => {
    const rawSql = "SELECT company FROM call_intelligence_view GROUP BY company HAVING pg_sleep(1) IS NULL";
    const result = validateAndSanitizeSql(rawSql);

    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/Prohibited function|Function 'pg_sleep' is not permitted/i);
  });

  it("should reject recursive CTE queries", () => {
    const rawSql = "WITH RECURSIVE rcte AS (SELECT 1 AS n UNION ALL SELECT n+1 FROM rcte WHERE n < 5) SELECT * FROM rcte";
    const result = validateAndSanitizeSql(rawSql);

    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/WITH queries \(CTEs\) are prohibited/i);
  });
});


