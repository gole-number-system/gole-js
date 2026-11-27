import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  Gole,
  GoleCompact,
  GoleCurrency,
  GoleFormat,
  GolePercent,
  GoleUnit,
  GoleDate,
  GoleInput,
  GolePairs,
  GoleProvider,
  GoleSymbol,
  GoleText,
  GoleTime,
  formatDatePattern,
  useGole,
} from "../src";

afterEach(cleanup);

describe("<Gole>", () => {
  it("pads, labels and only sets digits in the Gole font", () => {
    const { container } = render(<Gole value={12747.2} decimals={2} />);
    const el = screen.getByRole("img", { name: "12747.20" });
    expect(el.textContent).toBe("012747.20");
    expect(el.className).toBe("gole-number");
    expect(el.dataset.value).toBe("12747.20");
    expect([...container.querySelectorAll(".gole")].map((n) => n.textContent)).toEqual(["012747", "20"]);
  });

  it("keeps the sign outside the Gole font", () => {
    const { container } = render(<Gole value={-4.5} />);
    expect(container.textContent).toBe("-04.50");
    expect(container.querySelector(".gole")!.textContent).toBe("04");
  });

  it("supports as, className, label and the PUA build", () => {
    render(<Gole value={7} as="td" className="x" label="seven" build="pua" />, {
      container: document.body.appendChild(document.createElement("tr")),
    });
    const el = screen.getByRole("img", { name: "seven" });
    expect(el.tagName).toBe("TD");
    expect(el.className).toBe("gole-number x");
    expect(el.textContent).toBe("");
  });

  it("takes the build from the provider", () => {
    const { container } = render(
      <GoleProvider build="pua">
        <Gole value={123} />
      </GoleProvider>,
    );
    expect(container.textContent).toBe("");
  });
});

describe("<GoleText>", () => {
  it("converts every run of digits and labels each number", () => {
    const { container } = render(<GoleText>Bill 505-2347 at 9:05</GoleText>);
    expect(container.textContent).toBe("Bill 0505-2347 at 09:05");
    expect(screen.getAllByRole("img").map((n) => n.getAttribute("aria-label"))).toEqual(["505", "2347", "9", "05"]);
  });

  it("joins neighbouring strings and numbers, and walks into elements", () => {
    const count = 23;
    const { container } = render(
      <GoleText as="p">
        Total: 1{count} <b>and 7</b>
        <br />
      </GoleText>,
    );
    expect(container.querySelector("p")!.textContent).toBe("Total: 0123 and 07");
    expect(container.querySelector("b")!.textContent).toBe("and 07");
    expect(container.querySelector("br")).not.toBeNull();
  });

  it("strips grouping when asked", () => {
    const { container } = render(<GoleText grouping=",">1,234.5 kg</GoleText>);
    expect(container.textContent).toBe("1234.50 kg");
  });
});

describe("<GoleSymbol> and <GolePairs>", () => {
  it("renders one symbol", () => {
    render(<GoleSymbol value={5} />);
    expect(screen.getByRole("img", { name: "5" }).textContent).toBe("05");
    expect(() => render(<GoleSymbol value={100} />)).toThrow(RangeError);
  });

  it("marks the padded pairs", () => {
    const { container } = render(<GolePairs value="123.5" />);
    const pairs = [...container.querySelectorAll(".gole-pair")];
    expect(pairs.map((p) => p.querySelector(".gole-pair-digits")!.textContent)).toEqual(["01", "23", "50"]);
    expect(pairs.map((p) => p.getAttribute("data-pad"))).toEqual(["left", null, "right"]);
    expect(container.querySelector(".gole-pair-text")!.textContent).toBe(".");
    expect(screen.getByRole("img", { name: "123.5" })).toBeTruthy();
  });
});

describe("dates and times", () => {
  const date = new Date(2026, 10, 20, 9, 5, 7);

  it("formatDatePattern", () => {
    expect(formatDatePattern(date, "DD/MM/YYYY HH:mm:ss")).toBe("20/11/2026 09:05:07");
    expect(formatDatePattern(date, "hh:mm A [on] YY")).toBe("09:05 AM on 26");
    expect(formatDatePattern(new Date(Date.UTC(2026, 0, 1, 23, 0)), "DD.MM.YYYY HH", true)).toBe("01.01.2026 23");
  });

  it("<GoleDate> treats dots as separators, not decimal points", () => {
    const { container } = render(<GoleDate value={new Date(2026, 4, 1)} format="DD.MM.YYYY" />);
    const time = container.querySelector("time")!;
    expect(time.textContent).toBe("01.05.2026");
    expect(time.getAttribute("aria-label")).toBe("01.05.2026");
    expect(time.getAttribute("datetime")).toBeTruthy();
    expect(render(<GoleDate value="nonsense" />).container.innerHTML).toBe("");
  });

  it("<GoleTime> shows a fixed time, or ticks when live", () => {
    expect(render(<GoleTime value={date} format="HH:mm" />).container.textContent).toBe("09:05");

    vi.useFakeTimers();
    vi.setSystemTime(date);
    const { container } = render(<GoleTime />);
    expect(container.textContent).toBe("09:05:07");
    act(() => void vi.advanceTimersByTime(2000));
    expect(container.textContent).toBe("09:05:09");
    vi.useRealTimers();
  });
});

describe("<GoleInput>", () => {
  it("cleans what is typed and previews it in Gole", () => {
    const onValueChange = vi.fn();
    const { container } = render(<GoleInput defaultValue="123" onValueChange={onValueChange} aria-label="Amount" />);
    const input = screen.getByLabelText("Amount") as HTMLInputElement;
    expect(container.querySelector("output")!.textContent).toBe("0123");

    fireEvent.change(input, { target: { value: "-1a2.3.4" } });
    expect(onValueChange).toHaveBeenLastCalledWith("12.34");
    expect(input.value).toBe("12.34");
    expect(container.querySelector("output")!.textContent).toBe("12.34");

    fireEvent.change(input, { target: { value: "" } });
    expect(container.querySelector("output")!.textContent).toBe("");
  });

  it("can be controlled and allow negatives", () => {
    const onValueChange = vi.fn();
    render(<GoleInput value="5" onValueChange={onValueChange} allowNegative allowDecimal={false} aria-label="n" />);
    const input = screen.getByLabelText("n") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "-7.5" } });
    expect(onValueChange).toHaveBeenLastCalledWith("-75");
    expect(input.value).toBe("5");
  });
});

describe("useGole", () => {
  it("returns text, label, pairs and count", () => {
    const { result } = renderHook(() => useGole(123.5));
    expect(result.current).toMatchObject({ text: "0123.50", label: "123.5", pairs: ["01", "23", "50"], count: 3 });
  });
});

describe("locale-aware components", () => {
  it("<GoleCurrency> keeps the sign in the page font and labels with the ordinary text", () => {
    const { container } = render(<GoleCurrency value={1234.5} currency="INR" locale="en-IN" />);
    const el = screen.getByRole("img", { name: "₹1,234.50" });
    expect(el.textContent).toBe("₹1234.50");
    expect([...container.querySelectorAll(".gole")].map((n) => n.textContent)).toEqual(["1234", "50"]);
  });

  it("<GolePercent>, <GoleCompact> and <GoleUnit>", () => {
    const { container } = render(
      <GoleProvider locale="en-IN">
        <GolePercent value={0.456} maximumFractionDigits={1} />|<GoleCompact value={1234567} />|
        <GoleUnit value={72} unit="kilogram" />
      </GoleProvider>,
    );
    expect(container.textContent).toBe("45.60%|12L|72 kg");
  });

  it("<GoleFormat> takes any Intl options and the PUA build", () => {
    const { container } = render(
      <GoleFormat value={7} locale="en-US" build="pua" options={{ minimumFractionDigits: 2 }} as="td" />,
      { container: document.body.appendChild(document.createElement("tr")) },
    );
    expect(container.firstElementChild!.tagName).toBe("TD");
    expect(container.textContent).toBe(".");
  });
});
