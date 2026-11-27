import { describe, expect, it } from "vitest";
import {
  createGoleFormatter,
  fromGole,
  fromGolePUA,
  goleCount,
  goleLabel,
  golePairs,
  goleSegments,
  goleSymbol,
  parseDecimal,
  toGole,
  toGolePUA,
} from "../src";

describe("whole numbers: pad on the left", () => {
  it.each([
    [7, "07"],
    [35, "35"],
    [123, "0123"],
    [2026, "2026"],
    [0, "00"],
    [100000, "100000"],
    [1863486135148634156n, "01863486135148634156"],
    ["007", "0007"],
    ["1,00,000", "100000"],
    ["1,234,567", "01234567"],
  ])("toGole(%s) = %s", (value, expected) => {
    expect(toGole(value)).toBe(expected);
  });
});

describe("fractions: pad on the right", () => {
  it.each([
    ["144.00", "0144.00"],
    [12.5, "12.50"],
    [0.375, "00.3750"],
    [".5", "00.50"],
    ["1,234.5", "1234.50"],
    [1e21, "1000000000000000000000"],
    [1e-7, "00.00000010"],
    [1.5e-7, "00.00000015"],
  ])("toGole(%s) = %s", (value, expected) => {
    expect(toGole(value)).toBe(expected);
  });
});

describe("signs", () => {
  it("keeps the sign as plain text in front", () => {
    expect(toGole(-4.5)).toBe("-04.50");
    expect(toGole("\u22124.5")).toBe("\u221204.50");
    expect(toGole("+7")).toBe("+07");
    expect(goleSegments(-4.5)[0]).toEqual({ type: "text", text: "-" });
  });
});

describe("options", () => {
  it("decimals rounds half away from zero and pads", () => {
    expect(toGole(12747.2, { decimals: 2 })).toBe("012747.20");
    expect(toGole(1.005, { decimals: 2 })).toBe("01.01");
    expect(toGole(9.999, { decimals: 2 })).toBe("10.00");
    expect(toGole(99.5, { decimals: 0 })).toBe("0100");
    expect(toGole(0.125, { decimals: 1 })).toBe("00.10");
    expect(toGole(7, { decimals: 3 })).toBe("07.0000");
    expect(toGole("12345678901234567890.129", { decimals: 2 })).toBe("12345678901234567890.13");
    expect(() => toGole(1, { decimals: -1 })).toThrow(RangeError);
  });

  it("minPairs sets a minimum width", () => {
    expect(toGole(7, { minPairs: 2 })).toBe("0007");
    expect(toGole(12345, { minPairs: 2 })).toBe("012345");
  });
});

describe("PUA build", () => {
  it("maps pair n to U+E441 + n (decimal n)", () => {
    expect(toGolePUA(7)).toBe("\uE448");
    expect(toGolePUA(35)).toBe("\uE464");
    expect(toGolePUA(99)).toBe("\uE4A4");
    expect(toGolePUA(123)).toBe("\uE442\uE458");
    expect(toGolePUA(2026)).toBe("\uE455\uE45B");
    expect(toGolePUA(12.5)).toBe("\uE44D.\uE473");
    expect(toGole(-4.5, { build: "pua" })).toBe("-\uE445.\uE473");
  });

  it("round-trips", () => {
    expect(fromGolePUA(toGolePUA(123))).toBe("0123");
    expect(fromGolePUA(toGolePUA("144.00"))).toBe("0144.00");
    expect(fromGolePUA("a\uE442-\uE458 \u{1F600}")).toBe("a01-23 \u{1F600}");
    expect(fromGole(toGolePUA(12.5))).toBe(12.5);
    expect(fromGole(toGole(-123))).toBe(-123);
    expect(fromGole("12:05")).toBeNaN();
  });

  it("goleSymbol", () => {
    expect(goleSymbol(5)).toBe("05");
    expect(goleSymbol(35, "pua")).toBe("\uE464");
    expect(() => goleSymbol(100)).toThrow(RangeError);
    expect(() => goleSymbol(1.5)).toThrow(RangeError);
  });
});

describe("mixed text: every run of digits is padded on its own", () => {
  it.each([
    ["20/11/2026", "20/11/2026"],
    ["1/5/2026", "01/05/2026"],
    ["12:05:09", "12:05:09"],
    ["9:5", "09:05"],
    ["\u22124.5 \u00B0C", "\u221204.50 \u00B0C"],
    ["Bill 5055-002347", "Bill 5055-002347"],
    ["Bill 505-2347", "Bill 0505-2347"],
    ["1.5.2026", "01.05.2026"],
    ["192.168.1.1", "0192.0168.01.01"],
    ["10, 20", "10, 20"],
    ["1, 2 and 3.5%", "01, 02 and 03.50%"],
    ["no digits", "no digits"],
    ["", ""],
  ])("toGole(%j) = %j", (value, expected) => {
    expect(toGole(value)).toBe(expected);
  });

  it("leaves thousands separators alone unless grouping is set", () => {
    expect(toGole("Total 1,234.5 kg")).toBe("Total 01,0234.50 kg");
    expect(toGole("Total 1,234.5 kg", { grouping: "," })).toBe("Total 1234.50 kg");
    expect(toGole("Rs 12,34,567 only", { grouping: "," })).toBe("Rs 01234567 only");
    expect(toGole("1,2,3 go", { grouping: "," })).toBe("01,02,03 go");
  });

  it("decimalSeparator", () => {
    expect(toGole("v1.5", { decimalSeparator: false })).toBe("v01.05");
    expect(toGole("3,5 kg", { decimalSeparator: "," })).toBe("03,50 kg");
    expect(toGole("1.234,5 kg", { decimalSeparator: ",", grouping: "." })).toBe("1234,50 kg");
  });

  it("converts to PUA and keeps the text", () => {
    expect(toGolePUA("12:05")).toBe("\uE44D:\uE446");
  });

  it("non-finite numbers pass through", () => {
    expect(toGole(NaN)).toBe("NaN");
    expect(toGole(-Infinity)).toBe("-Infinity");
  });
});

describe("segments, labels, pairs", () => {
  it("describes a number", () => {
    expect(goleSegments(12.5)).toEqual([
      {
        type: "number",
        text: "12.50",
        value: "12.5",
        integer: "12",
        separator: ".",
        fraction: "50",
        pairs: ["12", "50"],
        integerPairs: 1,
        padLeft: 0,
        padRight: 1,
      },
    ]);
  });

  it("reports the padding", () => {
    expect(goleSegments(123)[0]).toMatchObject({ padLeft: 1, padRight: 0 });
    expect(goleSegments(7, { minPairs: 2 })[0]).toMatchObject({ padLeft: 3 });
    expect(goleSegments(".5")[0]).toMatchObject({ padLeft: 2, padRight: 1 });
  });

  it("merges text between numbers", () => {
    expect(goleSegments("a 1 b").map((s) => s.type)).toEqual(["text", "number", "text"]);
    expect(goleSegments("1.5.2026").map((s) => s.text)).toEqual(["01", ".", "05", ".", "2026"]);
  });

  it("goleLabel is the decimal text", () => {
    expect(goleLabel(12747.2, { decimals: 2 })).toBe("12747.20");
    expect(goleLabel(-4.5, { build: "pua" })).toBe("-4.5");
    expect(goleLabel(".5")).toBe("0.5");
    expect(goleLabel("Bill 505-2347")).toBe("Bill 505-2347");
  });

  it("golePairs and goleCount", () => {
    expect(golePairs(123)).toEqual(["01", "23"]);
    expect(golePairs("0.375")).toEqual(["00", "37", "50"]);
    expect(golePairs(123, { build: "pua" })).toEqual(["01", "23"]);
    expect(goleCount(1863486135148634156n)).toBe(10);
    expect(goleCount("12:05:09")).toBe(3);
  });

  it("createGoleFormatter", () => {
    const format = createGoleFormatter({ decimals: 2 });
    expect([1, 2.5].map(format)).toEqual(["01.00", "02.50"]);
  });
});

describe("parseDecimal", () => {
  it("rejects what is not one number", () => {
    for (const value of ["", ".", "-", "abc", "12:05", "1.2.3", NaN, Infinity, "e5"]) {
      expect(parseDecimal(value)).toBeNull();
    }
  });
  it("expands exponents", () => {
    expect(parseDecimal("1.25e3")).toEqual({ sign: "", integer: "1250", fraction: null });
    expect(parseDecimal("-12e-1")).toEqual({ sign: "-", integer: "1", fraction: "2" });
  });
});

describe("spaces around a number in a string", () => {
  it("keeps them", () => {
    expect(toGole(" 7 ")).toBe(" 07 ");
    expect(toGole("\t12.5\n")).toBe("\t12.50\n");
    expect(goleSegments(" 7 ").map((s) => s.type)).toEqual(["text", "number", "text"]);
  });
  it("does not affect numbers or their count", () => {
    expect(toGole(7)).toBe("07");
    expect(goleCount(" 123 ")).toBe(2);
  });
});
