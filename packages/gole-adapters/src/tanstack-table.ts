import type { CellContext, FilterFn, RowData, SortingFn } from "@tanstack/table-core";
import {
  compareGole,
  createGoleAdapterFormat,
  plainDecimal,
  type GoleAdapterOptions,
  type GoleRendering,
} from "./shared";

export { compareGole, type GoleAdapterOptions, type GoleRendering } from "./shared";

/**
 * Sorting function for numeric columns. Sorts by decimal value, exactly: numbers,
 * bigints, numeric strings of any length and Gole text in either build
 * (padded digits or PUA characters) all compare correctly.
 *
 * ```ts
 * columnHelper.accessor("amount", { sortingFn: goleSortingFn });
 * // or register it: createTable({ sortingFns: { gole: goleSortingFn }, ... }) and use sortingFn: "gole"
 * ```
 */
export const goleSortingFn: SortingFn<any> = (rowA, rowB, columnId) =>
  compareGole(rowA.getValue(columnId), rowB.getValue(columnId));

/**
 * Filter function for numeric columns.
 * - A `[min, max]` filter value keeps rows inside the range (either end may be empty).
 * - Any other value is matched as text against the plain decimal number, so typing
 *   `123` finds a cell that holds `123`, `"0123"` or the PUA text for it.
 *
 * ```ts
 * columnHelper.accessor("amount", { filterFn: goleFilterFn });
 * ```
 */
export const goleFilterFn: FilterFn<any> = (row, columnId, filterValue: unknown) => {
  const value = row.getValue(columnId);
  if (Array.isArray(filterValue)) {
    const [min, max] = filterValue as unknown[];
    const empty = (bound: unknown) => bound == null || bound === "";
    if (value == null || value === "") return empty(min) && empty(max);
    return (empty(min) || compareGole(value, min) >= 0) && (empty(max) || compareGole(value, max) <= 0);
  }
  const search = plainDecimal(String(filterValue ?? "").trim()).toLowerCase();
  return plainDecimal(value).toLowerCase().includes(search);
};
goleFilterFn.autoRemove = (value: unknown) =>
  value == null || value === "" || (Array.isArray(value) && value.every((bound) => bound == null || bound === ""));

/**
 * TanStack Table is headless, so `goleCell` returns data instead of markup:
 * `text` (Gole text), `label` (decimal text for `aria-label`), `segments` and
 * ready-made, escaped `html`. Render it with your framework.
 *
 * ```ts
 * const amount = goleCell({ decimals: 2 });
 * columnHelper.accessor("amount", { cell: (context) => amount(context).html });  // plain DOM: set as innerHTML
 * ```
 */
export function goleCell<TData extends RowData = any, TValue = unknown>(
  options: GoleAdapterOptions = {},
): (context: Pick<CellContext<TData, TValue>, "getValue">) => GoleRendering {
  const format = createGoleAdapterFormat(options);
  return (context) => format.render(context.getValue());
}
