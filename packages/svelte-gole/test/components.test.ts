import { render, screen } from "@testing-library/svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  Gole,
  GoleCompact,
  GoleCurrency,
  GoleDate,
  GoleFormat,
  GolePercent,
  GoleSymbol,
  GoleText,
  GoleTime,
  GoleUnit,
  getGoleContext,
  gole,
} from "../src/lib/index.js";
import ActionHost from "./ActionHost.svelte";
import WithContext from "./WithContext.svelte";

const PUA = (...pairs: number[]) => pairs.map((n) => String.fromCharCode(0xe441 + n)).join("");
const digits = (root: Element) => [...root.querySelectorAll(".gole")].map((node) => node.textContent);

afterEach(() => {
  vi.useRealTimers();
});

describe("<Gole>", () => {
  it("pads, labels and only sets digits in the Gole font", () => {
    const { container } = render(Gole, { value: 12747.2, decimals: 2 });
    const el = screen.getByRole("img", { name: "12747.20" });
    expect(el.tagName).toBe("SPAN");
    expect(el.className).toBe("gole-number");
    expect(el.dataset.value).toBe("12747.20");
    expect(el.innerHTML.replace(/<!--.*?-->/g, "")).toBe(
      '<span class="gole">012747</span>.<span class="gole">20</span>',
    );
    expect(container.textContent).toBe("012747.20");
  });

  it("keeps the sign outside the Gole font", () => {
    const { container } = render(Gole, { value: -4.5 });
    expect(container.textContent).toBe("-04.50");
    expect(digits(container)).toEqual(["04", "50"]);
  });

  it("supports minPairs, tag, class, label, other attributes and the PUA build", () => {
    render(Gole, { value: 7, minPairs: 2, tag: "strong", class: "x", label: "seven", build: "pua", id: "n" });
    const el = screen.getByRole("img", { name: "seven" });
    expect(el.tagName).toBe("STRONG");
    expect(el.className).toBe("gole-number x");
    expect(el.id).toBe("n");
    expect(el.textContent).toBe(PUA(0, 7));
  });

  it("follows prop changes", async () => {
    const { container, rerender } = render(Gole, { value: 5 });
    expect(container.textContent).toBe("05");
    await rerender({ value: 123.4 });
    expect(container.textContent).toBe("0123.40");
    expect(screen.getByRole("img").getAttribute("aria-label")).toBe("123.4");
  });
});

describe("<GoleText>", () => {
  it("converts every run of digits and labels each number", () => {
    const { container } = render(GoleText, { text: "Invoice 505-2347, 3 items" });
    expect(container.textContent).toBe("Invoice 0505-2347, 03 items");
    expect(screen.getAllByRole("img").map((el) => el.getAttribute("aria-label"))).toEqual(["505", "2347", "3"]);
    expect(digits(container)).toEqual(["0505", "2347", "03"]);
    expect(container.querySelector(".gole-number")!.parentElement!.tagName).toBe("SPAN");
  });

  it("supports grouping, tag and the PUA build", () => {
    const { container } = render(GoleText, { text: "Total 1,234.5 kg", grouping: ",", tag: "p", build: "pua" });
    expect(container.querySelector("p")!.textContent).toBe(`Total ${PUA(12, 34)}.${PUA(50)} kg`);
    expect(screen.getByRole("img", { name: "1,234.5" })).toBeTruthy();
  });
});

describe("<GoleSymbol>", () => {
  it("shows one symbol", () => {
    render(GoleSymbol, { value: 5 });
    const el = screen.getByRole("img", { name: "5" });
    expect(el.className).toBe("gole gole-symbol");
    expect(el.textContent).toBe("05");
  });
});

describe("context", () => {
  it("can only be read while a component is set up", () => {
    expect(() => getGoleContext()).toThrow();
  });

  it("sets the build and the locale for the components below", () => {
    render(WithContext, { config: { build: "pua", locale: "de-DE" } });
    expect(screen.getByTestId("number").textContent).toBe(PUA(1, 23));
    expect(screen.getByTestId("text").textContent).toBe(`Bill ${PUA(7)}`);
    expect(screen.getByTestId("symbol").textContent).toBe(PUA(5));
    const currency = screen.getByTestId("currency").querySelector(".gole-number")!;
    expect(currency.textContent).toBe(`${PUA(12, 34)},${PUA(50)} €`);
    expect(currency.getAttribute("aria-label")).toBe("1.234,50 €");
  });
});

describe("<GoleDate> and <GoleTime>", () => {
  it("shows a date in a labelled <time>", () => {
    const { container } = render(GoleDate, { value: "2026-11-20T12:05:09Z", utc: true });
    const el = container.querySelector("time")!;
    expect(el.className).toBe("gole-number");
    expect(el.getAttribute("role")).toBe("img");
    expect(el.getAttribute("aria-label")).toBe("20/11/2026");
    expect(el.getAttribute("datetime")).toBe("2026-11-20T12:05:09.000Z");
    expect(digits(el)).toEqual(["20", "11", "2026"]);
  });

  it("supports Intl formats with a locale", () => {
    const { container } = render(GoleDate, {
      value: "2026-11-05T00:00:00Z",
      utc: true,
      format: { day: "numeric", month: "long", year: "numeric" },
      locale: "en-GB",
    });
    expect(container.textContent).toBe("05 November 2026");
    expect(container.querySelector("time")!.getAttribute("aria-label")).toBe("5 November 2026");
  });

  it("renders nothing for an invalid date", () => {
    const { container } = render(GoleDate, { value: "not a date" });
    expect(container.querySelector("time")).toBeNull();
  });

  it("shows a fixed time", () => {
    const { container } = render(GoleTime, { value: "2026-11-20T09:05:07Z", utc: true, format: "HH:mm" });
    expect(container.textContent).toBe("09:05");
  });

  it("runs a live clock and stops it when destroyed", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-20T12:05:09Z"));
    const { container, unmount } = render(GoleTime, { utc: true });
    await vi.advanceTimersByTimeAsync(0);
    expect(container.textContent).toBe("12:05:09");
    expect(vi.getTimerCount()).toBe(1);

    await vi.advanceTimersByTimeAsync(2000);
    expect(container.textContent).toBe("12:05:11");
    expect(container.querySelector("time")!.getAttribute("aria-label")).toBe("12:05:11");

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("restarts the clock when the interval changes and stops it when a value arrives", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-20T12:05:09Z"));
    const { container, rerender } = render(GoleTime, { utc: true, format: "HH:mm:ss" });
    await rerender({ interval: 5000 });
    expect(vi.getTimerCount()).toBe(1);
    await vi.advanceTimersByTimeAsync(5000);
    expect(container.textContent).toBe("12:05:14");

    await rerender({ value: "2026-11-20T01:02:03Z" });
    expect(vi.getTimerCount()).toBe(0);
    expect(container.textContent).toBe("01:02:03");
  });
});

describe("locale-aware components", () => {
  it("<GoleFormat> keeps the currency sign outside the Gole font", () => {
    const { container } = render(GoleFormat, {
      value: 1234.5,
      locale: "en-IN",
      options: { style: "currency", currency: "INR" },
    });
    const el = screen.getByRole("img", { name: "₹1,234.50" });
    expect(el.className).toBe("gole-number");
    expect(el.textContent).toBe("₹1234.50");
    expect(digits(container)).toEqual(["1234", "50"]);
  });

  it("<GoleCurrency> follows the locale", () => {
    const { container } = render(GoleCurrency, { value: 1234.5, currency: "EUR", locale: "de-DE" });
    expect(container.textContent).toBe("1234,50 €");
    expect(screen.getByRole("img").getAttribute("aria-label")).toBe("1.234,50 €");
    expect(digits(container)).toEqual(["1234", "50"]);
  });

  it("<GolePercent>, <GoleCompact> and <GoleUnit>", () => {
    expect(render(GolePercent, { value: 0.456, locale: "en-US" }).container.textContent).toBe("46%");
    expect(
      render(GolePercent, { value: 0.4567, locale: "en-US", minimumFractionDigits: 1, maximumFractionDigits: 1 })
        .container.textContent,
    ).toBe("45.70%");
    expect(render(GoleCompact, { value: 1234567, locale: "en-US" }).container.textContent).toBe("01.20M");
    expect(render(GoleCompact, { value: 1234567, locale: "en-IN" }).container.textContent).toBe("12L");
    const unit = render(GoleUnit, { value: 72, unit: "kilometer-per-hour", locale: "en-US", tag: "b" }).container;
    expect(unit.querySelector("b")!.textContent).toBe("72 km/h");
    expect(digits(unit)).toEqual(["72"]);
  });
});

describe("use:gole", () => {
  it("renders a value and follows option changes", async () => {
    const { rerender } = render(ActionHost, { options: { value: 123, decimals: 2 } });
    const el = screen.getByTestId("value");
    expect(el.innerHTML).toBe(
      '<span class="gole-number" role="img" aria-label="123.00"><span class="gole">0123</span>.<span class="gole">00</span></span>',
    );
    await rerender({ options: { value: 7, build: "pua" } });
    expect(el.textContent).toBe(PUA(7));
    expect(el.querySelectorAll(".gole-number")).toHaveLength(1);
  });

  it("converts the element's own text", () => {
    render(ActionHost);
    const el = screen.getByTestId("own");
    expect(el.textContent).toBe("Bill 0505-2347");
    expect(digits(el)).toEqual(["0505", "2347"]);
    expect(screen.getByTestId("value").innerHTML).toBe("");
  });

  it("works as a plain function and keeps the original text for later updates", () => {
    const node = document.createElement("span");
    node.textContent = "Room 7";
    const result = gole(node, undefined);
    expect(node.textContent).toBe("Room 07");
    if (result && result.update) result.update({ minPairs: 2 });
    expect(node.textContent).toBe("Room 0007");
    if (result && result.update) result.update({ value: 42 });
    expect(node.textContent).toBe("42");
  });
});
