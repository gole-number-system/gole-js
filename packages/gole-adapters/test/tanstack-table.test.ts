import { toGole } from "@gole-number-system/gole-core";
import {
  createColumnHelper,
  createTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type CellContext,
  type ColumnFiltersState,
  type Row,
  type SortingState,
} from "@tanstack/table-core";
import { describe, expect, it } from "vitest";
import { goleCell, goleFilterFn, goleSortingFn } from "../src/tanstack-table";

const row = (value: unknown) => ({ getValue: () => value }) as unknown as Row<any>;
const noMeta = () => undefined;

describe("goleSortingFn", () => {
  it("compares by decimal value", () => {
    expect(goleSortingFn(row("100"), row("9"), "n")).toBe(1);
    expect(goleSortingFn(row("1863486135148634156"), row(1863486135148634157n), "n")).toBe(-1);
    expect(goleSortingFn(row(toGole(123, { build: "pua" })), row("0123"), "n")).toBe(0);
    expect(goleSortingFn(row(toGole(7, { build: "pua" })), row(toGole(1200, { build: "pua" })), "n")).toBe(-1);
  });
});

describe("goleFilterFn", () => {
  it("matches text against the plain decimal number", () => {
    expect(goleFilterFn(row("0123"), "n", "123", noMeta)).toBe(true);
    expect(goleFilterFn(row(toGole(123, { build: "pua" })), "n", "12", noMeta)).toBe(true);
    expect(goleFilterFn(row(12747.2), "n", "747", noMeta)).toBe(true);
    expect(goleFilterFn(row(12747.2), "n", "99", noMeta)).toBe(false);
    expect(goleFilterFn(row("Bill 7"), "n", "bill", noMeta)).toBe(true);
  });

  it("filters a [min, max] range exactly", () => {
    expect(goleFilterFn(row("50"), "n", [10, 100], noMeta)).toBe(true);
    expect(goleFilterFn(row("500"), "n", [10, 100], noMeta)).toBe(false);
    expect(goleFilterFn(row("5"), "n", [10, undefined], noMeta)).toBe(false);
    expect(goleFilterFn(row("5"), "n", ["", 10], noMeta)).toBe(true);
    expect(goleFilterFn(row("1863486135148634157"), "n", ["1863486135148634156", null], noMeta)).toBe(true);
    expect(goleFilterFn(row(null), "n", [1, 2], noMeta)).toBe(false);
  });

  it("removes itself for an empty filter", () => {
    expect(goleFilterFn.autoRemove!("")).toBe(true);
    expect(goleFilterFn.autoRemove!([undefined, ""])).toBe(true);
    expect(goleFilterFn.autoRemove!([1, ""])).toBe(false);
    expect(goleFilterFn.autoRemove!("7")).toBe(false);
  });
});

describe("goleCell", () => {
  const context = (value: unknown) => ({ getValue: () => value }) as CellContext<any, unknown>;

  it("returns text, label, segments and html", () => {
    const cell = goleCell({ decimals: 2 })(context(12747.2));
    expect(cell.text).toBe("012747.20");
    expect(cell.label).toBe("12747.20");
    expect(cell.segments).toHaveLength(1);
    expect(cell.html).toBe(
      '<span class="gole-number" role="img" aria-label="12747.20"><span class="gole">012747</span>.<span class="gole">20</span></span>',
    );
  });

  it("supports formats and escapes text", () => {
    const price = goleCell({ format: { locale: "en-IN", style: "currency", currency: "INR" } });
    expect(price(context("1234.5")).text).toBe("₹1234.50");
    expect(price(context("1234.5")).label).toBe("₹1,234.50");
    expect(goleCell()(context("<i>7</i>")).html).not.toContain("<i>");
    expect(goleCell()(context(null)).html).toBe("");
  });
});

describe("with a TanStack table", () => {
  type Item = { name: string; amount: string | bigint | number };
  const data: Item[] = [
    { name: "big", amount: "1863486135148634157" },
    { name: "hundred", amount: "100" },
    { name: "pua", amount: toGole(1200, { build: "pua" }) },
    { name: "nine", amount: 9 },
    { name: "bigint", amount: 1863486135148634156n },
  ];
  const helper = createColumnHelper<Item>();
  const amount = goleCell({ decimals: 2 });
  const columns = [
    helper.accessor("name", {}),
    helper.accessor("amount", { sortingFn: goleSortingFn, filterFn: goleFilterFn, cell: (ctx) => amount(ctx).html }),
  ];
  const table = (sorting: SortingState, columnFilters: ColumnFiltersState = []) =>
    createTable<Item>({
      data,
      columns,
      state: { sorting, columnFilters, columnPinning: { left: [], right: [] }, columnVisibility: {}, columnOrder: [] },
      onStateChange: () => undefined,
      renderFallbackValue: null,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
    });

  it("sorts with goleSortingFn", () => {
    const names = (desc: boolean) =>
      table([{ id: "amount", desc }])
        .getRowModel()
        .rows.map((entry) => entry.original.name);
    expect(names(false)).toEqual(["nine", "hundred", "pua", "bigint", "big"]);
    expect(names(true)).toEqual(["big", "bigint", "pua", "hundred", "nine"]);
  });

  it("filters with goleFilterFn and renders with goleCell", () => {
    const rows = table([{ id: "amount", desc: false }], [{ id: "amount", value: [100, 2000] }]).getRowModel().rows;
    expect(rows.map((entry) => entry.original.name)).toEqual(["hundred", "pua"]);
    const cell = rows[0]!.getVisibleCells().find((entry) => entry.column.id === "amount")!;
    const render = cell.column.columnDef.cell as (context: unknown) => string;
    expect(render(cell.getContext())).toContain('<span class="gole">0100</span>.<span class="gole">00</span>');
  });
});
