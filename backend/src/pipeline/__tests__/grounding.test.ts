import { describe, it, expect } from "vitest";
import {
  normalizeText,
  verifyEvidenceQuote,
  verifyFieldEvidence,
} from "../grounding";

describe("grounding - 2-Pass Fuzzy Matching Verifier", () => {
  const sampleTranscript = `
    Good morning Rahul, thanks for joining. We have a severe water leakage problem
    in our basement parking at Prestige Tech Park. Honestly, our current waterproofing
    contractor takes three weeks just to inspect the seepage, and it's delaying our occupancy certificate.
    We need an automated thermal scanner solution by next month.
  `;

  describe("normalizeText", () => {
    it("should lowercase and strip punctuation", () => {
      const input = "Hello, World! It's 100% working...";
      expect(normalizeText(input)).toBe("hello world it s 100 working");
    });
  });

  describe("verifyEvidenceQuote - Pass 1 (Exact Substring)", () => {
    it("should pass an exact substring quote immediately", () => {
      const quote = "severe water leakage problem in our basement parking";
      expect(verifyEvidenceQuote(quote, sampleTranscript)).toBe(true);
    });

    it("should pass an exact quote with differing case and punctuation", () => {
      const quote = "Severe water leakage problem, in our basement parking!";
      expect(verifyEvidenceQuote(quote, sampleTranscript)).toBe(true);
    });
  });

  describe("verifyEvidenceQuote - Pass 2 (Sliding Window Fuzzy Overlap)", () => {
    it("should pass when minor words like 'honestly' are omitted from the quote", () => {
      // Transcript: "Honestly, our current waterproofing contractor takes three weeks"
      // Quote drops "Honestly," -> 7 out of 8 words match (overlap ratio ~ 0.875 >= 0.8)
      const quote = "our current waterproofing contractor takes three weeks";
      expect(verifyEvidenceQuote(quote, sampleTranscript, 0.8)).toBe(true);
    });

    it("should reject a completely fabricated quote not in the transcript", () => {
      const fakeQuote = "We have approved fifty thousand dollars for this project immediately";
      expect(verifyEvidenceQuote(fakeQuote, sampleTranscript)).toBe(false);
    });

    it("should reject a quote with altered critical facts having low overlap", () => {
      const distortedQuote = "Our waterproofing vendor responds within thirty minutes every single day";
      expect(verifyEvidenceQuote(distortedQuote, sampleTranscript)).toBe(false);
    });

    it("should return false for empty or whitespace-only quotes", () => {
      expect(verifyEvidenceQuote("", sampleTranscript)).toBe(false);
      expect(verifyEvidenceQuote("   ", sampleTranscript)).toBe(false);
    });
  });

  describe("verifyFieldEvidence - Data Conflation Bug (null vs. false)", () => {
    it("should NOT flag a null or missing quote as low confidence", () => {
      const fieldEvidence = {
        customer_problem: "severe water leakage problem in our basement parking",
        current_solution: null, // Prospect never mentioned competitor
      };

      const result = verifyFieldEvidence(fieldEvidence, sampleTranscript);

      expect(result.fieldResults.customer_problem).toBe(true);
      expect(result.fieldResults.current_solution).toBe(true); // Treated as valid unmentioned
      expect(result.lowConfidenceFields).not.toContain("current_solution");
      expect(result.allPassed).toBe(true);
    });

    it("should flag a fabricated quote as low confidence while keeping valid quotes intact", () => {
      const fieldEvidence = {
        customer_problem: "severe water leakage problem in our basement parking",
        current_solution: "We currently use Bosch thermal scanners daily", // Fabricated!
      };

      const result = verifyFieldEvidence(fieldEvidence, sampleTranscript);

      expect(result.fieldResults.customer_problem).toBe(true);
      expect(result.fieldResults.current_solution).toBe(false);
      expect(result.lowConfidenceFields).toContain("current_solution");
      expect(result.allPassed).toBe(false);
    });
  });
});
