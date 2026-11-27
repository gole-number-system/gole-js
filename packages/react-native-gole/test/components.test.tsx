// @vitest-environment node
import { act, create, type ReactTestRenderer, type ReactTestRendererJSON } from "react-test-renderer";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Platform } from "react-native";
import {
  GOLE_FONT_FAMILY,
  GOLE_FONT_FILES,
  GOLE_FONT_POSTSCRIPT_NAME,
  Gole,
  GoleCompact,
  GoleCurrency,
  GoleDate,
  GoleFormat,
  GolePercent,
  GoleProvider,
  GoleSymbol,
  GoleText,
  GoleTime,
  GoleUnit,
  goleFontFamily,
  useGole,
  type UseGoleResult,
} from "../src";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Node = ReactTestRendererJSON | string;

let mounted: ReactTestRenderer[] = [];

function mount(element: ReactElement): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(element);
  });
  mounted.push(renderer);
  return renderer;
}

/** Render and return the outer `<Text>`. */
function render(element: ReactElement): ReactTestRendererJSON {
  const json = mount(element).toJSON();
  if (!json || Array.isArray(json)) throw new Error("expected one element");
  return json;
}

/** PUA characters as the digit pairs they stand for: "[01][23]". */
const pairs = (text: string) =>
  Array.from(text, (char) => {
    const n = char.codePointAt(0)! - 0xe441;
    return n >= 0 && n <= 99 ? `[${String(n).padStart(2, "0")}]` : char;
  }).join("");

const textOf = (node: Node): string => (typeof node === "string" ? node : (node.children ?? []).map(textOf).join(""));

/** The children of the outer Text: strings stay strings, digit runs become `{ font, text }`. */
const runs = (root: ReactTestRendererJSON) =>
  (root.children ?? []).map((child) =>
    typeof child === "string" ? child : { font: child.props.style?.fontFamily as string, text: pairs(textOf(child)) },
  );

beforeEach(() => {
  Platform.OS = "ios";
});

afterEach(() => {
  act(() => mounted.forEach((renderer) => renderer.unmount()));
  mounted = [];
  vi.useRealTimers();
});

describe("font family", () => {
  it("is the family name on iOS and the file name on Android", () => {
    expect(GOLE_FONT_FAMILY).toBe("GoleStandard");
    expect(GOLE_FONT_POSTSCRIPT_NAME).toBe("GoleStandard-Regular");
    expect(GOLE_FONT_FILES).toEqual({ ligature: "GoleStandard", pua: "GoleStandard_PUA" });
    expect(goleFontFamily()).toBe("GoleStandard");
    expect(goleFontFamily("pua", "android")).toBe("GoleStandard_PUA");
    expect(goleFontFamily("ligature", "android")).toBe("GoleStandard");
    Platform.OS = "android";
    expect(goleFontFamily()).toBe("GoleStandard_PUA");
  });
});

describe("<Gole>", () => {
  it("renders a Text with the PUA build by default, padded on the left", () => {
    const root = render(<Gole value={123} />);
    expect(root.type).toBe("Text");
    expect(runs(root)).toEqual([{ font: "GoleStandard", text: "[01][23]" }]);
    expect(textOf(root)).toBe("");
  });

  it("labels the outer Text with the decimal value", () => {
    const root = render(<Gole value={12747.2} decimals={2} />);
    expect(root.props.accessible).toBe(true);
    expect(root.props.accessibilityLabel).toBe("12747.20");
    expect(render(<Gole value={5} label="five" />).props.accessibilityLabel).toBe("five");
  });

  it("puts the font on the digit runs only", () => {
    const root = render(<Gole value={-4.5} style={{ fontSize: 20 }} />);
    expect(runs(root)).toEqual([
      "-",
      { font: "GoleStandard", text: "[04]" },
      ".",
      { font: "GoleStandard", text: "[50]" },
    ]);
    expect(root.props.style).toEqual({ fontSize: 20 });
  });

  it("pads to minPairs and passes Text props through", () => {
    const root = render(<Gole value={7} minPairs={2} numberOfLines={1} testID="n" />);
    expect(runs(root)).toEqual([{ font: "GoleStandard", text: "[00][07]" }]);
    expect(root.props.numberOfLines).toBe(1);
    expect(root.props.testID).toBe("n");
  });

  it("uses the file name as font family on Android", () => {
    Platform.OS = "android";
    expect(runs(render(<Gole value={35} />))).toEqual([{ font: "GoleStandard_PUA", text: "[35]" }]);
    expect(runs(render(<Gole value={35} build="ligature" />))).toEqual([{ font: "GoleStandard", text: "35" }]);
  });

  it("keeps padded digits with the ligature build", () => {
    const root = render(<Gole value={123.5} build="ligature" />);
    expect(runs(root)).toEqual([{ font: "GoleStandard", text: "0123" }, ".", { font: "GoleStandard", text: "50" }]);
  });

  it("takes a fontFamily prop", () => {
    expect(runs(render(<Gole value={35} fontFamily="Custom" />))).toEqual([{ font: "Custom", text: "[35]" }]);
  });
});

describe("<GoleProvider>", () => {
  it("sets the build and the font family for the components below", () => {
    const root = render(
      <GoleProvider build="ligature" fontFamily="MyGole">
        <Gole value={123} />
      </GoleProvider>,
    );
    expect(runs(root)).toEqual([{ font: "MyGole", text: "0123" }]);
  });

  it("is overridden by props", () => {
    const root = render(
      <GoleProvider build="ligature" fontFamily="MyGole">
        <Gole value={123} build="pua" fontFamily="Other" />
      </GoleProvider>,
    );
    expect(runs(root)).toEqual([{ font: "Other", text: "[01][23]" }]);
  });

  it("sets the locale", () => {
    const root = render(
      <GoleProvider locale="de-DE">
        <GoleFormat value={1234.5} options={{ minimumFractionDigits: 2 }} />
      </GoleProvider>,
    );
    expect(runs(root)).toEqual([
      { font: "GoleStandard", text: "[12][34]" },
      ",",
      { font: "GoleStandard", text: "[50]" },
    ]);
    expect(root.props.accessibilityLabel).toBe("1.234,50");
  });
});

describe("<GoleText>", () => {
  it("converts every run of digits and leaves the rest alone", () => {
    const root = render(<GoleText>Invoice 505-7, 3 items</GoleText>);
    expect(runs(root)).toEqual([
      "Invoice ",
      { font: "GoleStandard", text: "[05][05]" },
      "-",
      { font: "GoleStandard", text: "[07]" },
      ", ",
      { font: "GoleStandard", text: "[03]" },
      " items",
    ]);
    expect(root.props.accessible).toBe(true);
    expect(root.props.accessibilityLabel).toBe("Invoice 505-7, 3 items");
  });

  it("joins string and number children before converting", () => {
    const days = 12;
    const root = render(<GoleText>Ships in {days} days</GoleText>);
    expect(runs(root)).toEqual(["Ships in ", { font: "GoleStandard", text: "[12]" }, " days"]);
    expect(root.props.accessibilityLabel).toBe("Ships in 12 days");
  });

  it("removes a grouping separator when asked", () => {
    const root = render(<GoleText grouping=",">Total 1,234.5 kg</GoleText>);
    expect(runs(root)).toEqual([
      "Total ",
      { font: "GoleStandard", text: "[12][34]" },
      ".",
      { font: "GoleStandard", text: "[50]" },
      " kg",
    ]);
  });
});

describe("<GoleSymbol>", () => {
  it("renders one symbol", () => {
    const root = render(<GoleSymbol value={35} />);
    expect(runs(root)).toEqual([{ font: "GoleStandard", text: "[35]" }]);
    expect(root.props.accessibilityLabel).toBe("35");
  });
});

describe("<GoleDate> and <GoleTime>", () => {
  it("renders a date, one symbol per part", () => {
    const root = render(<GoleDate value={new Date(2026, 10, 5)} />);
    expect(runs(root)).toEqual([
      { font: "GoleStandard", text: "[05]" },
      "/",
      { font: "GoleStandard", text: "[11]" },
      "/",
      { font: "GoleStandard", text: "[20][26]" },
    ]);
    expect(root.props.accessibilityLabel).toBe("05/11/2026");
  });

  it("renders nothing for an invalid date", () => {
    expect(mount(<GoleDate value="not a date" />).toJSON()).toBeNull();
  });

  it("renders a fixed time", () => {
    const root = render(<GoleTime value={new Date(2026, 10, 20, 9, 5, 7)} format="HH:mm" />);
    expect(pairs(textOf(root))).toBe("[09]:[05]");
    expect(root.props.accessibilityLabel).toBe("09:05");
  });

  it("runs as a live clock without a value and clears its timer", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 20, 12, 5, 9));
    const renderer = mount(<GoleTime />);
    const root = () => renderer.toJSON() as ReactTestRendererJSON;
    expect(pairs(textOf(root()))).toBe("[12]:[05]:[09]");
    expect(root().props.accessibilityLabel).toBe("12:05:09");

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(pairs(textOf(root()))).toBe("[12]:[05]:[11]");
    expect(vi.getTimerCount()).toBe(1);

    act(() => renderer.unmount());
    mounted = [];
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("locale-aware components", () => {
  it("<GoleCurrency> keeps the currency sign in the text font", () => {
    const root = render(<GoleCurrency value={1234.5} currency="INR" locale="en-IN" />);
    expect(runs(root)).toEqual([
      "₹",
      { font: "GoleStandard", text: "[12][34]" },
      ".",
      { font: "GoleStandard", text: "[50]" },
    ]);
    expect(root.props.accessibilityLabel).toBe("₹1,234.50");
  });

  it("<GolePercent>, <GoleCompact> and <GoleUnit>", () => {
    expect(runs(render(<GolePercent value={0.456} locale="en-US" />))).toEqual([
      { font: "GoleStandard", text: "[46]" },
      "%",
    ]);
    const compact = render(<GoleCompact value={1500000} locale="en-US" />);
    expect(pairs(textOf(compact))).toBe("[01].[50]M");
    expect(compact.props.accessibilityLabel).toBe("1.5M");
    const unit = render(<GoleUnit value={72} unit="kilometer-per-hour" locale="en-US" />);
    expect(pairs(textOf(unit))).toBe("[72] km/h");
    expect(unit.props.accessibilityLabel).toBe("72 km/h");
  });
});

describe("useGole", () => {
  it("returns the text, label, pairs and font family", () => {
    let result!: UseGoleResult;
    function Probe() {
      result = useGole(123.5);
      return null;
    }
    mount(
      <GoleProvider fontFamily="MyGole">
        <Probe />
      </GoleProvider>,
    );
    expect(pairs(result.text)).toBe("[01][23].[50]");
    expect(result.label).toBe("123.5");
    expect(result.pairs).toEqual(["01", "23", "50"]);
    expect(result.count).toBe(3);
    expect(result.fontFamily).toBe("MyGole");
  });
});
