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
});
