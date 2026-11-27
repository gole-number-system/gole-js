import { describe, expect, it } from "vitest";
import {
  createGoleNumberFormat,
  formatDatePattern,
  goleCompact,
  goleCurrency,
  goleDate,
  goleDateLabel,
  goleDateSegments,
  goleFormat,
  goleFormatHTML,
  goleFormatLabel,
  goleFormatSegments,
  golePercent,
  goleUnit,
} from "../src";

describe("createGoleNumberFormat", () => {
  const inr = createGoleNumberFormat({ locale: "en-IN", style: "currency", currency: "INR" });

  it("keeps the currency sign as text and drops grouping from the Gole text", () => {
    expect(inr.format(1234.5)).toBe("₹1234.50");
    expect(inr.label(1234.5)).toBe("₹1,234.50");
    expect(inr.segments(1234.5)).toMatchObject([
      { type: "text", text: "₹" },
      { type: "number", integer: "1234", separator: ".", fraction: "50", value: "1234.50", pairs: ["12", "34", "50"] },
    ]);
  });

  it("pads odd whole parts and odd fractions", () => {
    expect(inr.format(123)).toBe("₹0123.00");
    expect(goleFormat(12.5, { locale: "en-US", maximumFractionDigits: 1 })).toBe("12.50");
  });

  it("handles negative values", () => {
    expect(inr.format(-45)).toBe("-₹45.00");
  });

  it("uses the locale's decimal separator and sign position", () => {
    expect(goleCurrency(1234.5, "EUR", { locale: "de-DE" })).toBe("1234,50 €");
  });

  it("supports the PUA build and minPairs", () => {
    expect(goleFormat(7, { locale: "en-US", build: "pua" })).toBe("");
    expect(goleFormat(7, { locale: "en-US", minPairs: 2 })).toBe("0007");
  });

  it("keeps big integers exact when given as strings or bigints", () => {
    expect(goleFormat("1863486135148634156", { locale: "en-US" })).toBe("01863486135148634156");
    expect(goleFormat(1863486135148634156n, { locale: "en-US" })).toBe("01863486135148634156");
  });

  it("writes one labelled HTML element", () => {
    expect(inr.html(1234.5)).toBe(
      '<span class="gole-number" role="img" aria-label="₹1,234.50">₹<span class="gole">1234</span>.<span class="gole">50</span></span>',
    );
    expect(goleFormatHTML(0.5, { locale: "en-US", style: "percent", digitsClass: "g" })).toBe(
      '<span class="gole-number" role="img" aria-label="50%"><span class="g">50</span>%</span>',
    );
  });
});

describe("presets", () => {
  it("golePercent multiplies by 100", () => {
    expect(golePercent(0.456, { locale: "en-US" })).toBe("46%");
    expect(golePercent(0.456, { locale: "en-US", maximumFractionDigits: 1 })).toBe("45.60%");
  });

  it("goleCompact names thousands, millions, lakh and crore", () => {
    expect(goleCompact(1200, { locale: "en-US" })).toBe("01.20K");
    expect(goleCompact(1234567, { locale: "en-US" })).toBe("01.20M");
    expect(goleCompact(1234567, { locale: "en-IN" })).toBe("12L");
    expect(goleCompact(250000000, { locale: "en-IN" })).toBe("25Cr");
  });

  it("goleUnit keeps the unit as text", () => {
    expect(goleUnit(72, "kilometer-per-hour", { locale: "en-US" })).toBe("72 km/h");
    expect(goleFormatSegments(5, { locale: "en-US", style: "unit", unit: "kilogram" })).toMatchObject([
      { type: "number", text: "05" },
      { type: "text", text: " kg" },
    ]);
  });

  it("goleFormatLabel is the ordinary text", () => {
    expect(goleFormatLabel(1234567, { locale: "en-IN" })).toBe("12,34,567");
  });
});

describe("dates", () => {
  const date = new Date(2026, 10, 20, 9, 5, 7);

  it("formatDatePattern fills tokens and keeps literals", () => {
    expect(formatDatePattern(date, "DD/MM/YYYY HH:mm:ss")).toBe("20/11/2026 09:05:07");
    expect(formatDatePattern(date, "hh:mm A [at DD]")).toBe("09:05 AM at DD");
  });

  it("goleDate pads every run of digits on its own", () => {
    expect(goleDate(date)).toBe("20/11/2026");
    expect(goleDate(date, { format: "D.M.YY" })).toBe("D.M.26");
    expect(goleDate(new Date(2026, 4, 1), { format: "DD.MM.YYYY", build: "pua" })).toBe("..");
    expect(goleDateSegments(date, { format: "HH:mm" }).filter((s) => s.type === "number")).toHaveLength(2);
  });

  it("accepts Intl.DateTimeFormat options", () => {
    const options = { format: { dateStyle: "medium" } as const, locale: "en-GB", utc: true };
    expect(goleDateLabel(Date.UTC(2026, 10, 5), options)).toBe("5 Nov 2026");
    expect(goleDate(Date.UTC(2026, 10, 5), options)).toBe("05 Nov 2026");
  });

  it("returns empty text for an invalid date", () => {
    expect(goleDate("not a date")).toBe("");
  });
});
