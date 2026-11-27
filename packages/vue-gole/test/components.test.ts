import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp, createSSRApp, defineComponent, h, nextTick, ref, withDirectives } from "vue";
import { renderToString } from "vue/server-renderer";
import {
  Gole,
  GoleCompact,
  GoleCurrency,
  GoleDate,
  GoleFormat,
  GolePercent,
  GolePlugin,
  GoleSymbol,
  GoleText,
  GoleTime,
  GoleUnit,
  provideGole,
  useGole,
  useGoleFontReady,
  vGole,
  type GoleConfig,
} from "../src";

const PUA = (...pairs: number[]) => pairs.map((n) => String.fromCharCode(0xe441 + n)).join("");
const digits = (el: Element) => [...el.querySelectorAll(".gole")].map((n) => n.textContent);

/** Mounts `render` below a component that calls provideGole(config). */
const withConfig = (config: GoleConfig | (() => GoleConfig), render: () => unknown) =>
  mount(
    defineComponent({
      setup() {
        provideGole(config);
        return () => h("div", null, render() as never);
      },
    }),
  );

afterEach(() => {
  vi.useRealTimers();
});

describe("<Gole>", () => {
  it("pads, labels and only sets digits in the Gole font", () => {
    const el = mount(Gole, { props: { value: 12747.2, decimals: 2 } }).element as HTMLElement;
    expect(el.tagName).toBe("SPAN");
    expect(el.className).toBe("gole-number");
    expect(el.getAttribute("role")).toBe("img");
    expect(el.getAttribute("aria-label")).toBe("12747.20");
    expect(el.dataset.value).toBe("12747.20");
    expect(el.textContent).toBe("012747.20");
    expect(digits(el)).toEqual(["012747", "20"]);
  });

  it("keeps the sign and the decimal point outside the Gole font", () => {
    const el = mount(Gole, { props: { value: -4.5 } }).element;
    expect(el.textContent).toBe("-04.50");
    expect(digits(el)).toEqual(["04", "50"]);
    expect([...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent)).toEqual(["-", "."]);
  });

  it("supports tag, as, class, label, minPairs, bigint and the PUA build", () => {
    const el = mount(Gole, { props: { value: 7, tag: "td", label: "seven", build: "pua" }, attrs: { class: "x" } }).element;
    expect(el.tagName).toBe("TD");
    expect(el.className).toBe("gole-number x");
    expect(el.getAttribute("aria-label")).toBe("seven");
    expect(el.textContent).toBe(PUA(7));
    expect(mount(Gole, { props: { value: 7, as: "b" } }).element.tagName).toBe("B");
    expect(mount(Gole, { props: { value: 7, minPairs: 2 } }).text()).toBe("0007");
    expect(mount(Gole, { props: { value: 123n } }).text()).toBe("0123");
  });

  it("updates when the value changes", async () => {
    const wrapper = mount(Gole, { props: { value: 5 } });
    await wrapper.setProps({ value: 123 });
    expect(wrapper.text()).toBe("0123");
    expect(wrapper.attributes("aria-label")).toBe("123");
  });
});

describe("provideGole and GolePlugin", () => {
  it("takes the build from provideGole, and a prop wins over it", () => {
    const wrapper = withConfig({ build: "pua" }, () => [
      h(Gole, { value: 123 }),
      h(Gole, { value: 123, build: "ligature" }),
      h(GoleSymbol, { value: 35 }),
    ]);
    const [a, b] = wrapper.findAll(".gole-number");
    expect(a!.text()).toBe(PUA(1, 23));
    expect(a!.attributes("aria-label")).toBe("123");
    expect(b!.text()).toBe("0123");
    expect(wrapper.find(".gole-symbol").text()).toBe(PUA(35));
  });

  it("follows a reactive config and keeps settings from further up", async () => {
    const build = ref<"ligature" | "pua">("ligature");
    const Inner = defineComponent({
      setup() {
        provideGole(() => ({ build: build.value }));
        return () => h(GoleText, null, () => "1,234 items");
      },
    });
    const wrapper = withConfig({ grouping: "," }, () => h(Inner));
    expect(wrapper.text()).toBe("1234 items");
    build.value = "pua";
    await nextTick();
    expect(wrapper.text()).toBe(`${PUA(12, 34)} items`);
  });

  it("registers components, the directive and the defaults", () => {
    const host = document.createElement("div");
    const App = defineComponent({
      template: `<Gole :value="123" /><GoleCurrency :value="5" currency="USD" /><i v-gole>7 days</i><b v-gole.ligature="7"></b>`,
    });
    const wrapper = mount(App, { global: { plugins: [[GolePlugin, { build: "pua", locale: "en-US" }]] }, attachTo: host });
    expect(wrapper.find(".gole-number").text()).toBe(PUA(1, 23));
    expect(wrapper.findAll(".gole-number")[1]!.text()).toBe(`$${PUA(5)}.${PUA(0)}`);
    expect(wrapper.find("i").text()).toBe(`${PUA(7)} days`);
    expect(wrapper.find("i").element.innerHTML).toContain('aria-label="7"');
    expect(wrapper.find("b").text()).toBe("07");

    const app = createApp({ render: () => null }).use(GolePlugin);
    expect(app.component("GoleTime")).toBe(GoleTime);
    expect(app.directive("gole")).toBeTruthy();
  });
});

describe("<GoleText>", () => {
  it("converts every run of digits and labels each number", () => {
    const wrapper = mount(GoleText, { slots: { default: () => "Invoice 5055-002347, 3 items, 12.5 kg" } });
    expect(wrapper.element.tagName).toBe("SPAN");
    expect(wrapper.text()).toBe("Invoice 5055-002347, 03 items, 12.50 kg");
    expect(wrapper.findAll(".gole-number").map((n) => n.attributes("aria-label"))).toEqual(["5055", "002347", "3", "12.5"]);
    expect(wrapper.findAll("[role=img]")).toHaveLength(4);
    expect(digits(wrapper.element)).toEqual(["5055", "002347", "03", "12", "50"]);
  });

  it("supports grouping, decimalSeparator, minPairs and tag", () => {
    const text = (props: Record<string, unknown>, content: string) =>
      mount(GoleText, { props, slots: { default: () => content } });
    expect(text({ grouping: "," }, "Total 1,234.5 kg").text()).toBe("Total 1234.50 kg");
    expect(text({ decimalSeparator: false }, "v1.2").text()).toBe("v01.02");
    expect(text({ decimalSeparator: "," }, "1,5").text()).toBe("01,50");
    expect(text({ minPairs: 2 }, "7").text()).toBe("0007");
    expect(text({ tag: "p" }, "7").element.tagName).toBe("P");
  });

  it("converts text in nested elements and keeps their attributes", async () => {
    const days = ref(3);
    const wrapper = mount(
      defineComponent({
        components: { GoleText },
        setup: () => ({ days, id: 123 }),
        template: `<GoleText tag="p">Order <b class="id" title="t">{{ id }}</b> ships in {{ days }} days<!-- note --></GoleText>`,
      }),
    );
    expect(wrapper.element.tagName).toBe("P");
    expect(wrapper.text()).toBe("Order 0123 ships in 03 days");
    const b = wrapper.find("b");
    expect(b.classes()).toEqual(["id"]);
    expect(b.attributes("title")).toBe("t");
    expect(b.find(".gole-number").attributes("aria-label")).toBe("123");

    days.value = 12345;
    await nextTick();
    expect(wrapper.text()).toBe("Order 0123 ships in 012345 days");
    expect(wrapper.find("b").text()).toBe("0123");
  });

  it("joins neighbouring text and flattens v-for fragments", () => {
    const wrapper = mount(
      defineComponent({
        components: { GoleText },
        template: `<GoleText><template v-for="n in [1, 2]">{{ n }}</template> <em v-for="n in [5, 6]" :key="n">{{ n }}</em></GoleText>`,
      }),
    );
    expect(wrapper.text()).toBe("12 0506");
    expect(wrapper.findAll("em").map((n) => n.text())).toEqual(["05", "06"]);
  });

  it("leaves child components alone", () => {
    const Child = defineComponent({ render: () => h("code", "42 + 1") });
    const wrapper = mount(defineComponent({ render: () => h(GoleText, null, () => ["7 ", h(Child)]) }));
    expect(wrapper.text()).toBe("07 42 + 1");
  });
});

describe("<GoleSymbol>", () => {
  it("renders one symbol", () => {
    const wrapper = mount(GoleSymbol, { props: { value: 5 } });
    expect(wrapper.text()).toBe("05");
    expect(wrapper.classes()).toEqual(["gole", "gole-symbol"]);
    expect(wrapper.attributes("aria-label")).toBe("5");
    expect(mount(GoleSymbol, { props: { value: 99, build: "pua" } }).text()).toBe(PUA(99));
  });
});

describe("<GoleDate> and <GoleTime>", () => {
  const date = new Date(2026, 10, 20, 9, 5, 7);

  it("pads every part of a date", () => {
    const wrapper = mount(GoleDate, { props: { value: new Date(2026, 2, 5) } });
    expect(wrapper.element.tagName).toBe("TIME");
    expect(wrapper.text()).toBe("05/03/2026");
    expect(wrapper.attributes("aria-label")).toBe("05/03/2026");
    expect(wrapper.attributes("datetime")).toBe(new Date(2026, 2, 5).toISOString());
    expect(digits(wrapper.element)).toEqual(["05", "03", "2026"]);
  });

  it("supports patterns, utc, Intl options with a locale, and invalid dates", () => {
    expect(mount(GoleDate, { props: { value: date, format: "D.M.YY [at] H:mm" } }).text()).toContain("at");
    expect(mount(GoleDate, { props: { value: "2026-11-20T00:30:00Z", utc: true } }).text()).toBe("20/11/2026");
    const medium = mount(GoleDate, { props: { value: date, format: { dateStyle: "medium" }, locale: "en-GB" } });
    expect(medium.attributes("aria-label")).toBe("20 Nov 2026");
    expect(digits(medium.element)).toEqual(["20", "2026"]);
    expect(mount(GoleDate, { props: { value: "nope" } }).find("time").exists()).toBe(false);
  });

  it("shows a fixed time without starting a timer", () => {
    vi.useFakeTimers();
    const wrapper = mount(GoleTime, { props: { value: date } });
    expect(wrapper.text()).toBe("09:05:07");
    expect(mount(GoleTime, { props: { value: date, format: "hh:mm A" } }).text()).toBe("09:05 AM");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("runs a live clock from mount to unmount", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 20, 9, 5, 7));
    const wrapper = mount(GoleTime);
    await nextTick();
    expect(wrapper.text()).toBe("09:05:07");
    expect(wrapper.attributes("aria-label")).toBe("09:05:07");
    expect(digits(wrapper.element)).toEqual(["09", "05", "07"]);

    vi.advanceTimersByTime(2000);
    await nextTick();
    expect(wrapper.text()).toBe("09:05:09");

    await wrapper.setProps({ interval: 5000 });
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(4000);
    await nextTick();
    expect(wrapper.text()).toBe("09:05:09");
    vi.advanceTimersByTime(1000);
    await nextTick();
    expect(wrapper.text()).toBe("09:05:14");

    await wrapper.setProps({ value: new Date(2026, 0, 1, 1, 2, 3) });
    expect(wrapper.text()).toBe("01:02:03");
    expect(vi.getTimerCount()).toBe(0);

    await wrapper.setProps({ value: undefined });
    expect(vi.getTimerCount()).toBe(1);
    wrapper.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("server rendering", () => {
  it("renders numbers, and a live clock as an empty <time> with no timer", async () => {
    vi.useFakeTimers();
    const app = createSSRApp({ render: () => [h(Gole, { value: 123 }), h(GoleTime)] }).use(GolePlugin, { build: "pua" });
    const html = await renderToString(app);
    expect(html).toContain(`<span class="gole-number" role="img" aria-label="123" data-value="123"><span class="gole">${PUA(1, 23)}</span></span>`);
    expect(html).toContain("<time></time>");
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("locale-aware components", () => {
  it("<GoleCurrency> keeps the currency sign and separators outside the Gole font", () => {
    const el = mount(GoleCurrency, { props: { value: 1234.5, currency: "INR", locale: "en-IN" } }).element;
    expect(el.className).toBe("gole-number");
    expect(el.getAttribute("role")).toBe("img");
    expect(el.getAttribute("aria-label")).toBe("₹1,234.50");
    expect(el.textContent).toBe("₹1234.50");
    expect(digits(el)).toEqual(["1234", "50"]);
  });

  it("takes the locale and the build from provideGole", () => {
    const wrapper = withConfig({ locale: "de-DE", build: "pua" }, () =>
      h(GoleCurrency, { value: 1234.5, currency: "EUR" }),
    );
    const el = wrapper.find(".gole-number");
    expect(el.attributes("aria-label")).toBe("1.234,50 €");
    expect(el.text()).toBe(`${PUA(12, 34)},${PUA(50)} €`);
  });

  it("<GoleFormat>, <GolePercent>, <GoleCompact> and <GoleUnit>", async () => {
    const format = mount(GoleFormat, {
      props: { value: 5, locale: "en-US", options: { minimumFractionDigits: 2 }, tag: "td", label: "five" },
    });
    expect(format.element.tagName).toBe("TD");
    expect(format.attributes("aria-label")).toBe("five");
    expect(format.text()).toBe("05.00");
    await format.setProps({ options: { minimumFractionDigits: 4 } });
    expect(format.text()).toBe("05.0000");

    expect(mount(GolePercent, { props: { value: 0.456, locale: "en-US" } }).text()).toBe("46%");
    expect(mount(GolePercent, { props: { value: 0.456, locale: "en-US", maximumFractionDigits: 1 } }).text()).toBe("45.60%");
    const compact = mount(GoleCompact, { props: { value: 1234567, locale: "en-US" } });
    expect(compact.text()).toBe("01.20M");
    expect(compact.attributes("aria-label")).toBe("1.2M");
    const unit = mount(GoleUnit, { props: { value: 72, unit: "kilometer-per-hour", locale: "en-US" }, attrs: { class: "speed" } });
    expect(unit.text()).toBe("72 km/h");
    expect(unit.classes()).toEqual(["gole-number", "speed"]);
  });
});

describe("v-gole", () => {
  const html = (el: Element) => el.innerHTML;

  it("converts the element's own text and follows changes", async () => {
    const count = ref(7);
    const wrapper = mount(
      defineComponent({
        directives: { gole: vGole },
        setup: () => ({ count }),
        template: `<p v-gole>Invoice 5055, {{ count }} items</p>`,
      }),
    );
    expect(wrapper.text()).toBe("Invoice 5055, 07 items");
    expect(wrapper.findAll(".gole-number").map((n) => n.attributes("aria-label"))).toEqual(["5055", "7"]);
    expect(digits(wrapper.element)).toEqual(["5055", "07"]);

    count.value = 123;
    await nextTick();
    expect(wrapper.text()).toBe("Invoice 5055, 0123 items");
  });

  it("does not convert its own output again when the component re-renders", async () => {
    const other = ref(0);
    const wrapper = mount(
      defineComponent({
        directives: { gole: vGole },
        setup: () => ({ other }),
        template: `<div :data-other="other"><p v-gole>7 days</p></div>`,
      }),
    );
    const before = html(wrapper.find("p").element);
    other.value = 1;
    await nextTick();
    expect(wrapper.attributes("data-other")).toBe("1");
    expect(html(wrapper.find("p").element)).toBe(before);
    expect(wrapper.find("p").text()).toBe("07 days");
  });

  it("takes a bound value or options, and the build from a modifier or the argument", async () => {
    const total = ref(12747.2);
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h("div", [
            withDirectives(h("a"), [[vGole, total.value]]),
            withDirectives(h("b"), [[vGole, { value: total.value, decimals: 1, minPairs: 4 }]]),
            withDirectives(h("i"), [[vGole, 123, undefined, { pua: true }]]),
            withDirectives(h("u"), [[vGole, 123, "pua"]]),
            withDirectives(h("s"), [[vGole, { value: "1,234", grouping: ",", build: "pua" }]]),
          ]),
      }),
    );
    expect(wrapper.find("a").text()).toBe("012747.20");
    expect(wrapper.find("a .gole-number").attributes("aria-label")).toBe("12747.2");
    expect(wrapper.find("b").text()).toBe("00012747.20");
    expect(wrapper.find("i").text()).toBe(PUA(1, 23));
    expect(wrapper.find("u").text()).toBe(PUA(1, 23));
    expect(wrapper.find("s").text()).toBe(PUA(12, 34));

    total.value = 5;
    await nextTick();
    expect(wrapper.find("a").text()).toBe("05");
    expect(wrapper.find("b").text()).toBe("00000005.00");
  });

  it("keeps the spaces around a lone number", () => {
    const wrapper = mount(defineComponent({ directives: { gole: vGole }, template: `<pre v-gole> 7 </pre>` }));
    expect(wrapper.element.textContent).toBe(" 07 ");
  });

  it("escapes text", () => {
    const wrapper = mount(defineComponent({ setup: () => () => withDirectives(h("p"), [[vGole, "<b>5</b> & 6"]]) }));
    expect(wrapper.find("b").exists()).toBe(false);
    expect(wrapper.text()).toBe("<b>05</b> & 06");
  });
});

describe("composables", () => {
  it("useGole returns computed text, label, pairs and segments", async () => {
    const value = ref<number | string>(12747.2);
    let result!: ReturnType<typeof useGole>;
    const wrapper = withConfig({ build: "pua" }, () =>
      h(
        defineComponent({
          setup() {
            result = useGole(value, { decimals: 2 });
            return () => h("span", { "aria-label": result.label.value }, result.text.value);
          },
        }),
      ),
    );
    expect(result.text.value).toBe(`${PUA(1, 27, 47)}.${PUA(20)}`);
    expect(result.label.value).toBe("12747.20");
    expect(result.pairs.value).toEqual(["01", "27", "47", "20"]);
    expect(result.count.value).toBe(4);
    expect(result.segments.value).toHaveLength(1);

    value.value = 5;
    await nextTick();
    expect(wrapper.text()).toBe(`${PUA(5)}.${PUA(0)}`);
    expect(result.label.value).toBe("5.00");
  });

  it("useGole works outside a component with the default build", () => {
    const { text, label } = useGole(() => "9:05", () => ({ decimalSeparator: false }));
    expect(text.value).toBe("09:05");
    expect(label.value).toBe("9:05");
  });

  it("useGoleFontReady turns true after the font has loaded", async () => {
    const load = vi.fn(() => Promise.resolve([]));
    Object.defineProperty(document, "fonts", { value: { load }, configurable: true });
    let ready!: ReturnType<typeof useGoleFontReady>;
    mount(
      defineComponent({
        setup() {
          ready = useGoleFontReady();
          return () => h("i");
        },
      }),
    );
    expect(ready.value).toBe(false);
    await vi.waitFor(() => expect(ready.value).toBe(true));
    expect(load).toHaveBeenCalledWith('16px "GoleStandard"', "00");
    delete (document as { fonts?: unknown }).fonts;
  });
});
