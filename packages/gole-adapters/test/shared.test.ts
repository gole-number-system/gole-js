import { toGole } from "@gole-number-system/gole-core";
import { describe, expect, it } from "vitest";
import { compareGole, createGoleAdapterFormat, goleFontStack, plainDecimal } from "../src/index";

describe("goleFontStack", () => {
  it("puts the Gole font before the fallback", () => {
    expect(goleFontStack()).toBe('"GoleStandard", sans-serif');
    expect(goleFontStack("Inter, sans-serif")).toBe('"GoleStandard", Inter, sans-serif');
  });
});

describe("createGoleAdapterFormat", () => {
  it("pads plain numbers with the core options", () => {
    const format = createGoleAdapterFormat({ decimals: 2 });
    expect(format.text(12747.2)).toBe("012747.20");
    expect(format.label(12747.2)).toBe("12747.20");
    expect(format.text(-4.5)).toBe("-04.50");
    expect(format.label(-4.5)).toBe("-4.50");
    expect(format.isNumber("12.5")).toBe(true);
    expect(format.isNumber("12:05")).toBe(false);
  });

  it("supports the PUA build and minPairs", () => {
    expect(createGoleAdapterFormat({ build: "pua" }).text(123)).toBe(toGole(123, { build: "pua" }));
    expect(createGoleAdapterFormat({ minPairs: 2 }).text(7)).toBe("0007");
  });

  it("formats with a locale-aware number format", () => {
    const format = createGoleAdapterFormat({ format: { locale: "en-IN", style: "currency", currency: "INR" } });
    expect(format.text(1234.5)).toBe("₹1234.50");
    expect(format.label(1234.5)).toBe("₹1,234.50");
    expect(format.text("1,234.5")).toBe("₹1234.50");
    expect(format.html(1234.5)).toBe(
      '<span class="gole-number" role="img" aria-label="₹1,234.50">₹<span class="gole">1234</span>.<span class="gole">50</span></span>',
    );
  });

  it("never turns text into NaN when a format is set", () => {
    const format = createGoleAdapterFormat({ format: { style: "percent" } });
    expect(format.text("Q3 2026")).toBe("Q03 2026");
    expect(format.text(null)).toBe("");
    expect(format.text(undefined)).toBe("");
  });

  it("returns escaped HTML and all parts from render()", () => {
    const format = createGoleAdapterFormat();
    const rendering = format.render("<b>7</b>");
    expect(rendering.html).not.toContain("<b>");
    expect(rendering.html).toContain('<span class="gole">07</span>');
    expect(rendering.text).toBe("<b>07</b>");
    expect(rendering.label).toBe("<b>7</b>");
    expect(rendering.segments.map((segment) => segment.type)).toEqual(["text", "number", "text"]);
  });
});

describe("compareGole", () => {
  it("sorts numbers, bigints and numeric strings by value", () => {
    const values = ["100", 9n, "0012.5", 3, "-2", -10, "1,00,000"];
    expect([...values].sort(compareGole)).toEqual([-10, "-2", 3, 9n, "0012.5", "100", "1,00,000"]);
  });

  it("is exact beyond Number precision", () => {
    expect(compareGole("1863486135148634156", "1863486135148634157")).toBe(-1);
    expect(compareGole(1863486135148634157n, "1863486135148634156")).toBe(1);
    expect(compareGole("0.10000000000000000001", "0.1")).toBe(1);
    expect(compareGole("-1863486135148634157", "-1863486135148634156")).toBe(-1);
  });

  it("treats equal values in different spellings as equal", () => {
    expect(compareGole("0123", 123)).toBe(0);
    expect(compareGole("12.50", 12.5)).toBe(0);
    expect(compareGole("-0", 0)).toBe(0);
    expect(compareGole(1e21, "1000000000000000000000")).toBe(0);
  });

  it("reads Gole PUA text", () => {
    const pua = (value: number) => toGole(value, { build: "pua" });
    expect([pua(1200), pua(7), pua(12.5), pua(123)].sort(compareGole)).toEqual([pua(7), pua(12.5), pua(123), pua(1200)]);
    expect(compareGole(pua(123), 123)).toBe(0);
  });

  it("puts empty values first and other text last", () => {
    expect(["abc", 5, null, "", undefined, "Abc", 1].sort(compareGole)).toEqual([null, "", 1, 5, "Abc", "abc", undefined]);
    expect(compareGole(undefined, 1)).toBe(-1);
    expect(compareGole(null, "")).toBe(0);
    expect(compareGole("x", "x")).toBe(0);
  });
});

describe("plainDecimal", () => {
  it("removes padding and reads PUA text", () => {
    expect(plainDecimal("0123")).toBe("123");
    expect(plainDecimal(toGole(12.5, { build: "pua" }))).toBe("12.50");
    expect(plainDecimal(12n)).toBe("12");
    expect(plainDecimal("00")).toBe("0");
    expect(plainDecimal("Bill 7")).toBe("Bill 7");
    expect(plainDecimal(null)).toBe("");
  });
});
