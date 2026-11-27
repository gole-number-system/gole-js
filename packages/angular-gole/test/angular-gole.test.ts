import { Component, LOCALE_ID, provideZonelessChangeDetection, signal, type Provider, type Type } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  GOLE_CONFIG,
  GoleDateDirective,
  GoleDirective,
  GoleFormatDirective,
  GoleLabelPipe,
  GolePipe,
  GoleTextDirective,
  GoleTimeDirective,
  provideGole,
} from "../src/public-api";

const imports = [
  GolePipe,
  GoleLabelPipe,
  GoleDirective,
  GoleTextDirective,
  GoleFormatDirective,
  GoleDateDirective,
  GoleTimeDirective,
];

const PUA = (n: number) => String.fromCharCode(0xe441 + n);

/** Render a host component and return its fixture and the first element of its template. */
function mount<T>(component: Type<T>, providers: Provider[] = []) {
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection(), ...providers] });
  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();
  const root = fixture.nativeElement as HTMLElement;
  return { fixture, root, host: root.firstElementChild as HTMLElement };
}

/** Text of the elements that carry the Gole font. */
const digits = (element: Element) => Array.from(element.querySelectorAll(".gole"), (span) => span.textContent);

describe("gole pipe", () => {
  it("pads the value and takes decimals or options", () => {
    @Component({
      imports,
      template: `<i>{{ 123 | gole }}</i><i>{{ 12747.2 | gole: 2 }}</i><i>{{ 7 | gole: { minPairs: 2 } }}</i><i>{{ none | gole }}</i>`,
    })
    class Host {
      none = null;
    }
    const { root } = mount(Host);
    expect(Array.from(root.querySelectorAll("i"), (i) => i.textContent)).toEqual(["0123", "012747.20", "0007", ""]);
  });

  it("uses the build from provideGole, and an option overrides it", () => {
    @Component({ imports, template: `<i>{{ 123 | gole }}</i><i>{{ 123 | gole: { build: "ligature" } }}</i>` })
    class Host {}
    const { root } = mount(Host, [provideGole({ build: "pua" })]);
    expect(Array.from(root.querySelectorAll("i"), (i) => i.textContent)).toEqual([PUA(1) + PUA(23), "0123"]);
  });

  it("goleLabel gives the decimal text", () => {
    @Component({ imports, template: `<i>{{ 12747.2 | goleLabel: 2 }}</i><i>{{ "-4.5" | goleLabel }}</i>` })
    class Host {}
    const { root } = mount(Host, [provideGole({ build: "pua" })]);
    expect(Array.from(root.querySelectorAll("i"), (i) => i.textContent)).toEqual(["12747.20", "-4.5"]);
  });
});

describe("[gole]", () => {
  it("renders padded digits in .gole and labels the host", () => {
    @Component({ imports, template: `<span [gole]="123"></span>` })
    class Host {}
    const { host } = mount(Host);
    expect(host.outerHTML).toBe(
      '<span class="gole-number" role="img" aria-label="123"><span class="gole">0123</span></span>',
    );
  });

  it("keeps the sign and the decimal point outside the font class", () => {
    @Component({ imports, template: `<span [gole]="-12747.2" [goleDecimals]="2"></span>` })
    class Host {}
    const { host } = mount(Host);
    expect(digits(host)).toEqual(["012747", "20"]);
    expect(host.textContent).toBe("-012747.20");
    expect(Array.from(host.childNodes, (node) => node.nodeType)).toEqual([3, 1, 3, 1]);
    expect(host.getAttribute("aria-label")).toBe("-12747.20");
  });

  it("takes minPairs, attribute strings, a label and keeps the host's own classes", () => {
    @Component({
      imports,
      template: `<td class="amount" [gole]="7" goleMinPairs="2" goleDecimals="1" goleLabel="seven"></td>`,
    })
    class Host {}
    const { host } = mount(Host);
    expect(digits(host)).toEqual(["0007", "00"]);
    expect(host.getAttribute("aria-label")).toBe("seven");
    expect(host.className).toBe("amount gole-number");
  });

  it("updates when the inputs change and clears on null", () => {
    @Component({ imports, template: `<span [gole]="value()" [goleDecimals]="decimals()"></span>` })
    class Host {
      value = signal<number | string | bigint | null>(5);
      decimals = signal<number | undefined>(undefined);
    }
    const { fixture, host } = mount(Host);
    expect(host.textContent).toBe("05");

    fixture.componentInstance.value.set(1863486135148634156n);
    fixture.detectChanges();
    expect(host.textContent).toBe("01863486135148634156");
    expect(host.getAttribute("aria-label")).toBe("1863486135148634156");

    fixture.componentInstance.value.set("12.5");
    fixture.componentInstance.decimals.set(0);
    fixture.detectChanges();
    expect(host.textContent).toBe("13");
    expect(host.children.length).toBe(1);

    fixture.componentInstance.value.set(null);
    fixture.detectChanges();
    expect(host.childNodes.length).toBe(0);
    expect(host.hasAttribute("aria-label")).toBe(false);
    expect(host.hasAttribute("role")).toBe(false);
  });

  it("writes text nodes, never markup", () => {
    @Component({ imports, template: `<span [gole]="value"></span>` })
    class Host {
      value = `<img src=x onerror="alert(1)"> 5`;
    }
    const { host } = mount(Host);
    expect(host.querySelector("img")).toBeNull();
    expect(host.textContent).toBe(`<img src=x onerror="alert(01)"> 05`);
  });

  it("uses PUA characters with provideGole({ build: 'pua' }), and goleBuild overrides it", () => {
    @Component({
      imports,
      template: `<span [gole]="123.4"></span><span [gole]="123.4" goleBuild="ligature"></span>`,
    })
    class Host {}
    const { root, host } = mount(Host, [provideGole({ build: "pua" })]);
    expect(digits(host)).toEqual([PUA(1) + PUA(23), PUA(40)]);
    expect(host.textContent).toBe(`${PUA(1)}${PUA(23)}.${PUA(40)}`);
    expect(host.getAttribute("aria-label")).toBe("123.4");
    expect(digits(root.children[1]!)).toEqual(["0123", "40"]);
  });

  it("provideGole also works in the providers of a component", () => {
    @Component({ imports, providers: [provideGole({ build: "pua" })], template: `<span [gole]="7"></span>` })
    class Host {}
    const { host } = mount(Host);
    expect(host.textContent).toBe(PUA(7));
    expect(TestBed.inject(GOLE_CONFIG)).toEqual({});
  });
});

describe("[goleText]", () => {
  it("converts every run of digits and labels each number", () => {
    @Component({ imports, template: `<p [goleText]="'Invoice 5055-002347, 3 items'"></p>` })
    class Host {}
    const { host } = mount(Host);
    expect(host.textContent).toBe("Invoice 5055-002347, 03 items");
    expect(digits(host)).toEqual(["5055", "002347", "03"]);
    const numbers = Array.from(host.querySelectorAll(".gole-number"));
    expect(numbers.map((number) => number.getAttribute("aria-label"))).toEqual(["5055", "002347", "3"]);
    expect(numbers.every((number) => number.getAttribute("role") === "img")).toBe(true);
    expect(host.hasAttribute("role")).toBe(false);
    expect(host.classList.contains("gole-number")).toBe(false);
  });

  it("takes grouping and decimalSeparator, and updates", () => {
    @Component({
      imports,
      template: `<p [goleText]="text()" goleGrouping=","></p><p [goleText]="'1.5.2026'" [goleDecimalSeparator]="false"></p>`,
    })
    class Host {
      text = signal("Total 1,234.5 kg");
    }
    const { fixture, root, host } = mount(Host);
    expect(host.textContent).toBe("Total 1234.50 kg");
    expect(digits(host)).toEqual(["1234", "50"]);
    expect(host.querySelector(".gole-number")!.getAttribute("aria-label")).toBe("1,234.5");
    expect(root.children[1]!.textContent).toBe("01.05.2026");

    fixture.componentInstance.text.set("9 left");
    fixture.detectChanges();
    expect(host.textContent).toBe("09 left");
    expect(host.querySelectorAll(".gole-number").length).toBe(1);
  });

  it("uses the build from provideGole", () => {
    @Component({ imports, template: `<p [goleText]="'Room 7'"></p>` })
    class Host {}
    const { host } = mount(Host, [provideGole({ build: "pua" })]);
    expect(host.textContent).toBe(`Room ${PUA(7)}`);
  });
});

describe("[goleFormat]", () => {
  it("formats currency for the locale and keeps the sign outside the font class", () => {
    @Component({ imports, template: `<span [goleFormat]="1234.5" goleCurrency="INR" goleLocale="en-IN"></span>` })
    class Host {}
    const { host } = mount(Host);
    expect(host.textContent).toBe("₹1234.50");
    expect(digits(host)).toEqual(["1234", "50"]);
    expect(host.getAttribute("aria-label")).toBe("₹1,234.50");
    expect(host.getAttribute("role")).toBe("img");
    expect(host.className).toBe("gole-number");
  });

  it("takes the locale from provideGole, then from LOCALE_ID", () => {
    @Component({ imports, template: `<span [goleFormat]="1234567.5" [goleOptions]="options"></span>` })
    class Host {
      options = { minimumFractionDigits: 2 };
    }
    const german = mount(Host, [provideGole({ locale: "de-DE" })]).host;
    expect(german.textContent).toBe("01234567,50");
    expect(german.getAttribute("aria-label")).toBe("1.234.567,50");

    TestBed.resetTestingModule();
    const indian = mount(Host, [{ provide: LOCALE_ID, useValue: "en-IN" }]).host;
    expect(indian.getAttribute("aria-label")).toBe("12,34,567.50");

    TestBed.resetTestingModule();
    expect(mount(Host).host.getAttribute("aria-label")).toBe("1,234,567.50");
  });

  it("has shorthands for percent, compact and unit", () => {
    @Component({
      imports,
      template: `
        <span [goleFormat]="0.456" golePercent></span>
        <span [goleFormat]="1234567" goleCompact goleLocale="en-IN"></span>
        <span [goleFormat]="72" goleUnit="kilometer-per-hour"></span>
        <span [goleFormat]="5" goleCurrency="JPY" goleBuild="pua" goleMinPairs="2" goleLabel="five yen"></span>
      `,
    })
    class Host {}
    const { root } = mount(Host);
    const [percent, compact, unit, yen] = Array.from(root.children);
    expect(percent!.textContent).toBe("46%");
    expect(digits(percent!)).toEqual(["46"]);
    expect(compact!.textContent).toBe("12L");
    expect(compact!.getAttribute("aria-label")).toBe("12L");
    expect(unit!.textContent).toBe("72 km/h");
    expect(digits(unit!)).toEqual(["72"]);
    expect(yen!.textContent).toBe(`¥${PUA(0)}${PUA(5)}`);
    expect(yen!.getAttribute("aria-label")).toBe("five yen");
  });

  it("rebuilds the formatter when an option changes", () => {
    @Component({ imports, template: `<span [goleFormat]="value()" [goleCurrency]="currency()"></span>` })
    class Host {
      value = signal<number | null>(1234.5);
      currency = signal("USD");
    }
    const { fixture, host } = mount(Host);
    expect(host.textContent).toBe("$1234.50");

    fixture.componentInstance.currency.set("JPY");
    fixture.detectChanges();
    expect(host.textContent).toBe("¥1235");

    fixture.componentInstance.value.set(7);
    fixture.detectChanges();
    expect(host.textContent).toBe("¥07");

    fixture.componentInstance.value.set(null);
    fixture.detectChanges();
    expect(host.textContent).toBe("");
  });
});

describe("[goleDate] and [goleTime]", () => {
  afterEach(() => vi.useRealTimers());

  it("renders a date with one symbol per part", () => {
    @Component({ imports, template: `<time [goleDate]="'2026-11-20T00:00:00Z'" goleUtc></time>` })
    class Host {}
    const { host } = mount(Host);
    expect(host.textContent).toBe("20/11/2026");
    expect(digits(host)).toEqual(["20", "11", "2026"]);
    expect(host.getAttribute("aria-label")).toBe("20/11/2026");
    expect(host.getAttribute("role")).toBe("img");
  });

  it("takes a pattern or Intl options, and renders nothing for an invalid date", () => {
    @Component({
      imports,
      template: `
        <span [goleDate]="date" goleDateFormat="D.M.YY" goleUtc></span>
        <span [goleDate]="date" [goleDateFormat]="{ dateStyle: 'medium' }" goleLocale="en-IN" goleUtc></span>
        <span [goleDate]="'not a date'"></span>
      `,
    })
    class Host {
      date = new Date(Date.UTC(2026, 4, 1));
    }
    const { root } = mount(Host);
    const [pattern, intl, invalid] = Array.from(root.children);
    expect(pattern!.textContent).toBe("D.M.26");
    expect(intl!.textContent).toBe("01 May 2026");
    expect(intl!.getAttribute("aria-label")).toBe("1 May 2026");
    expect(digits(intl!)).toEqual(["01", "2026"]);
    expect(invalid!.childNodes.length).toBe(0);
    expect(invalid!.hasAttribute("aria-label")).toBe(false);
  });

  it("renders a fixed time without starting a timer", () => {
    vi.useFakeTimers();
    @Component({
      imports,
      template: `<time [goleTime]="'2026-11-20T09:05:03Z'" goleTimeFormat="HH:mm" goleUtc goleBuild="pua"></time>`,
    })
    class Host {}
    const { host } = mount(Host);
    expect(host.textContent).toBe(`${PUA(9)}:${PUA(5)}`);
    expect(host.getAttribute("aria-label")).toBe("09:05");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("runs a live clock without change detection and stops it on destroy", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 10, 20, 12, 5, 9)));
    let checks = 0;
    @Component({ imports, template: `<time goleTime goleUtc></time>{{ check() }}` })
    class Host {
      check() {
        checks++;
        return "";
      }
    }
    const { fixture, host } = mount(Host);
    expect(host.textContent).toBe("12:05:09");
    expect(digits(host)).toEqual(["12", "05", "09"]);
    expect(vi.getTimerCount()).toBe(1);
    const checked = checks;

    vi.advanceTimersByTime(2000);
    expect(host.textContent).toBe("12:05:11");
    expect(host.getAttribute("aria-label")).toBe("12:05:11");
    expect(checks).toBe(checked);

    fixture.destroy();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("switches between a live clock and a fixed time", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 10, 20, 23, 59, 59)));
    @Component({ imports, template: `<time [goleTime]="value()" [goleInterval]="500" goleUtc></time>` })
    class Host {
      value = signal<string | null>(null);
    }
    const { fixture, host } = mount(Host);
    expect(host.textContent).toBe("23:59:59");
    vi.advanceTimersByTime(1000);
    expect(host.textContent).toBe("00:00:00");

    fixture.componentInstance.value.set("2026-01-01T01:02:03Z");
    fixture.detectChanges();
    expect(host.textContent).toBe("01:02:03");
    expect(vi.getTimerCount()).toBe(0);
  });
});
