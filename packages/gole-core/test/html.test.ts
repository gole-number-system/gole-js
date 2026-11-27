// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { goleHTML, goleReady, renderGole } from "../src";

describe("goleHTML", () => {
  it("wraps each number and only puts digits in the Gole font", () => {
    expect(goleHTML(12.5)).toBe(
      '<span class="gole-number" role="img" aria-label="12.5"><span class="gole">12</span>.<span class="gole">50</span></span>',
    );
    expect(goleHTML("Bill 505-2347")).toBe(
      'Bill <span class="gole-number" role="img" aria-label="505"><span class="gole">0505</span></span>' +
        '-<span class="gole-number" role="img" aria-label="2347"><span class="gole">2347</span></span>',
    );
  });

  it("escapes text", () => {
    expect(goleHTML('<b a="1">')).toContain("&#60;b a=&#34;");
  });

  it("supports the PUA build and custom classes", () => {
    expect(goleHTML(7, { build: "pua", numberClass: "n", digitsClass: "d" })).toBe(
      '<span class="n" role="img" aria-label="7"><span class="d">\uE448</span></span>',
    );
  });
});

describe("renderGole", () => {
  it("converts [data-gole] elements, honours data options and can be re-run", () => {
    document.body.innerHTML =
      '<p><span id="a" data-gole>123</span> <span id="b" data-gole data-gole-decimals="2">12747.2</span> <span id="c">5</span></p>';
    renderGole();
    const a = document.getElementById("a")!;
    const b = document.getElementById("b")!;
    expect(a.textContent).toBe("0123");
    expect(a.dataset.goleValue).toBe("123");
    expect(b.textContent).toBe("012747.20");
    expect(document.getElementById("c")!.textContent).toBe("5");

    renderGole();
    expect(a.textContent).toBe("0123");

    a.textContent = "7";
    b.dataset.goleValue = "1";
    renderGole();
    expect(a.textContent).toBe("07");
    expect(b.textContent).toBe("01.00");
  });

  it("goleReady resolves without a FontFaceSet", async () => {
    await expect(goleReady()).resolves.toBeUndefined();
  });
});
