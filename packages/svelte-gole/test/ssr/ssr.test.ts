import { render } from "svelte/server";
import { describe, expect, it } from "vitest";
import { Gole, GoleCurrency, GoleTime } from "../../src/lib/index.js";
import ActionHost from "../ActionHost.svelte";

const strip = (html: string) => html.replace(/<!--.*?-->/g, "");

describe("server rendering", () => {
  it("renders numbers to HTML", () => {
    expect(strip(render(Gole, { props: { value: 12.5 } }).body)).toBe(
      '<span role="img" aria-label="12.5" data-value="12.5" class="gole-number"><span class="gole">12</span>.<span class="gole">50</span></span>',
    );
    expect(strip(render(GoleCurrency, { props: { value: 5, currency: "USD", locale: "en-US" } }).body)).toContain(
      '$<span class="gole">05</span>.<span class="gole">00</span>',
    );
  });

  it("renders a live clock empty and starts no timer", () => {
    expect(strip(render(GoleTime, { props: { class: "clock" } }).body)).toBe('<time class="clock"></time>');
    expect(strip(render(GoleTime, { props: { value: "2026-11-20T09:05:07Z", utc: true } }).body)).toContain(
      'aria-label="09:05:07"',
    );
  });

  it("leaves the text of use:gole elements as it is", () => {
    expect(strip(render(ActionHost).body)).toContain("Bill 505-2347");
  });
});
