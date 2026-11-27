import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { defineGoleElements, setGoleElementDefaults, type GoleNumberElement } from "../src";

beforeAll(() => defineGoleElements());
afterEach(() => {
  document.body.innerHTML = "";
  setGoleElementDefaults({ build: "ligature", locale: undefined });
  vi.useRealTimers();
});

const mount = <T extends HTMLElement = HTMLElement>(html: string) => {
  document.body.innerHTML = html;
  return document.body.firstElementChild as T;
};
const digits = (el: Element) => [...el.querySelectorAll(".gole")].map((n) => n.textContent);

describe("<gole-number>", () => {
  it("renders the value attribute with padding and a label", () => {
    const el = mount('<gole-number value="12747.2" decimals="2"></gole-number>');
    expect(el.textContent).toBe("012747.20");
    expect(digits(el)).toEqual(["012747", "20"]);
    expect(el.getAttribute("role")).toBe("img");
    expect(el.getAttribute("aria-label")).toBe("12747.20");
  });

  it("takes its value from the text when there is no attribute", () => {
    const el = mount("<gole-number>-4.5</gole-number>");
    expect(el.textContent).toBe("-04.50");
    expect(digits(el)).toEqual(["04", "50"]);
  });

  it("re-renders when attributes, the property or the text change", () => {
    const el = mount<GoleNumberElement>('<gole-number value="7"></gole-number>');
    el.setAttribute("min-pairs", "2");
    expect(el.textContent).toBe("0007");
    el.value = 123;
    expect(el.textContent).toBe("0123");
    el.removeAttribute("value");
    el.removeAttribute("min-pairs");
    el.textContent = "35";
    el.update();
    expect(el.textContent).toBe("35");
    expect(el.value).toBe("35");
  });

  it("formats currency, percent, compact and unit", () => {
    const html = (attrs: string) => mount(`<gole-number locale="en-IN" ${attrs}></gole-number>`);
    const money = html('value="1234.5" format="currency" currency="INR"');
    expect(money.textContent).toBe("₹1234.50");
    expect(money.getAttribute("aria-label")).toBe("₹1,234.50");
    expect(html('value="0.456" format="percent" max-fraction-digits="1"').textContent).toBe("45.60%");
    expect(html('value="1234567" format="compact"').textContent).toBe("12L");
    expect(html('value="72" format="unit" unit="kilogram"').textContent).toBe("72 kg");
  });

  it("falls back to the plain number when the format cannot be built", () => {
    expect(mount('<gole-number value="5" format="currency"></gole-number>').textContent).toBe("05");
  });

  it("supports the PUA build per element and as a default", () => {
    expect(mount('<gole-number value="7" build="pua"></gole-number>').textContent).toBe("");
    const el = mount('<gole-number value="7"></gole-number>');
    setGoleElementDefaults({ build: "pua" });
    expect(el.textContent).toBe("");
  });

  it("escapes text and clears when empty", () => {
    const el = mount('<gole-number value="&lt;b&gt;5"></gole-number>');
    expect(el.querySelector("b")).toBeNull();
    el.setAttribute("value", "");
    expect(el.innerHTML).toBe("");
    expect(el.hasAttribute("aria-label")).toBe(false);
  });
});

describe("<gole-text>", () => {
  it("converts every run of digits and labels each number", () => {
    const el = mount("<gole-text>Bill 505-2347, 12.5 kg</gole-text>");
    expect(el.textContent).toBe("Bill 0505-2347, 12.50 kg");
    expect([...el.querySelectorAll('[role="img"]')].map((n) => n.getAttribute("aria-label"))).toEqual([
      "505",
      "2347",
      "12.5",
    ]);
    expect(el.hasAttribute("role")).toBe(false);
  });

  it("supports grouping and no decimal separator", () => {
    expect(mount('<gole-text grouping=",">Total 1,234.5</gole-text>').textContent).toBe("Total 1234.50");
    expect(mount('<gole-text decimal-separator="none">1.5.2026</gole-text>').textContent).toBe("01.05.2026");
  });
});

describe("<gole-date> and <gole-time>", () => {
  it("formats with a pattern", () => {
    const el = mount('<gole-date value="2026-11-20T09:05:00" format="DD.MM.YY HH:mm"></gole-date>');
    expect(el.textContent).toBe("20.11.26 09:05");
    expect(el.getAttribute("aria-label")).toBe("20.11.26 09:05");
    expect(digits(el)).toEqual(["20", "11", "26", "09", "05"]);
  });

  it("formats with Intl styles and timestamps", () => {
    const el = mount(`<gole-date value="${Date.UTC(2026, 10, 5)}" date-style="medium" locale="en-GB" utc></gole-date>`);
    expect(el.textContent).toBe("05 Nov 2026");
    expect(el.getAttribute("aria-label")).toBe("5 Nov 2026");
  });

  it("<gole-time> without a value is a live clock that stops when removed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 20, 12, 5, 9));
    const el = mount("<gole-time></gole-time>");
    expect(el.textContent).toBe("12:05:09");
    vi.advanceTimersByTime(1000);
    expect(el.textContent).toBe("12:05:10");
    el.remove();
    vi.advanceTimersByTime(5000);
    expect(el.textContent).toBe("12:05:10");
  });

  it("<gole-time> with a value does not tick", () => {
    vi.useFakeTimers();
    const el = mount('<gole-time value="2026-11-20T09:05:00" format="HH:mm"></gole-time>');
    vi.advanceTimersByTime(3000);
    expect(el.textContent).toBe("09:05");
  });
});
