import { AllCommunityModule, ModuleRegistry, createGrid, type ColDef, type GridApi } from "ag-grid-community";
import { afterEach, describe, expect, it } from "vitest";
import { goleCellRenderer, goleColDef, goleComparator } from "../src/ag-grid";

describe("goleCellRenderer", () => {
  it("returns an element with Gole markup and a label", () => {
    const element = goleCellRenderer({ decimals: 2 })({ value: 12747.2 });
    expect(element).toBeInstanceOf(HTMLElement);
    expect(element.className).toBe("gole-cell");
    expect(element.getAttribute("role")).toBe("img");
    expect(element.getAttribute("aria-label")).toBe("12747.20");
    expect([...element.querySelectorAll(".gole")].map((digits) => digits.textContent)).toEqual(["012747", "20"]);
    expect(element.textContent).toBe("012747.20");
  });

  it("labels negative numbers with their sign", () => {
    const element = goleCellRenderer()({ value: -4.5 });
    expect(element.getAttribute("aria-label")).toBe("-4.5");
    expect(element.textContent).toBe("-04.50");
  });

  it("renders a locale format as one labelled number", () => {
    const element = goleCellRenderer({ format: { locale: "en-IN", style: "currency", currency: "INR" } })({ value: "1234.5" });
    const number = element.querySelector(".gole-number")!;
    expect(number.getAttribute("role")).toBe("img");
    expect(number.getAttribute("aria-label")).toBe("₹1,234.50");
    expect(element.textContent).toBe("₹1234.50");
    expect(element.hasAttribute("role")).toBe(false);
  });

  it("never injects cell values as HTML", () => {
    const element = goleCellRenderer()({ value: '<img src=x onerror="alert(1)"> 7' });
    expect(element.querySelector("img")).toBeNull();
    expect(element.textContent).toBe('<img src=x onerror="alert(01)"> 07');
    expect(element.hasAttribute("role")).toBe(false);
  });

  it("renders empty cells empty, keeps bigints exact and takes a class", () => {
    const render = goleCellRenderer({ cellClass: "amount" });
    expect(render({ value: null }).innerHTML).toBe("");
    expect(render({ value: "" }).innerHTML).toBe("");
    expect(render({ value: undefined }).className).toBe("amount");
    expect(render({ value: 1863486135148634156n }).textContent).toBe("01863486135148634156");
  });
});

describe("goleComparator", () => {
  it("sorts numerically, including long numeric strings", () => {
    expect(["100", "9", "18634861351486341560", "18634861351486341559", 25n].sort(goleComparator)).toEqual([
      "9",
      25n,
      "100",
      "18634861351486341559",
      "18634861351486341560",
    ]);
  });
});

describe("goleColDef", () => {
  it("returns renderer, formatter, comparator and alignment", () => {
    const colDef = goleColDef({ decimals: 2 });
    expect(typeof colDef.cellRenderer).toBe("function");
    expect(colDef.comparator).toBe(goleComparator);
    expect(colDef.cellClass).toBe("ag-right-aligned-cell");
    expect(colDef.headerClass).toBe("ag-right-aligned-header");
    const format = colDef.valueFormatter as (params: { value: unknown }) => string;
    expect(format({ value: 12747.2 })).toBe("12747.20");
    expect(format({ value: null })).toBe("");
  });

  it("formats the export text with the locale format", () => {
    const colDef = goleColDef({ format: { locale: "en-IN", style: "currency", currency: "INR" } });
    const format = colDef.valueFormatter as (params: { value: unknown }) => string;
    expect(format({ value: 1234.5 })).toBe("₹1,234.50");
  });
});

describe("with AG Grid in jsdom", () => {
  let api: GridApi | undefined;
  afterEach(() => api?.destroy());

  it("renders Gole cells and sorts by value", async () => {
    ModuleRegistry.registerModules([AllCommunityModule]);
    const host = document.createElement("div");
    host.style.width = "600px";
    host.style.height = "400px";
    document.body.append(host);

    type Row = { item: string; amount: string };
    const columnDefs: ColDef<Row>[] = [{ field: "item" }, { field: "amount", sort: "asc", ...goleColDef<Row>({ decimals: 2 }) }];
    api = createGrid<Row>(host, {
      columnDefs,
      rowData: [
        { item: "b", amount: "1863486135148634157" },
        { item: "a", amount: "1863486135148634156" },
        { item: "c", amount: "12.5" },
      ],
      suppressColumnVirtualisation: true,
      domLayout: "print",
    });

    await expect.poll(() => host.querySelectorAll(".gole-cell").length, { timeout: 5000 }).toBe(3);

    const sorted: string[] = [];
    api.forEachNodeAfterFilterAndSort((node) => sorted.push(node.data!.item));
    expect(sorted).toEqual(["c", "a", "b"]);

    const cell = [...host.querySelectorAll('[col-id="amount"] .gole-cell')].find((el) => el.textContent === "12.50")!;
    expect(cell.getAttribute("aria-label")).toBe("12.50");
    expect([...cell.querySelectorAll(".gole")].map((digits) => digits.textContent)).toEqual(["12", "50"]);
    expect(cell.closest(".ag-cell")!.classList.contains("ag-right-aligned-cell")).toBe(true);
  });
});
