import type { ColDef, ICellRendererParams, ValueFormatterParams } from "ag-grid-community";
import { compareGole, createGoleAdapterFormat, type GoleAdapterOptions } from "./shared";

export { compareGole, type GoleAdapterOptions } from "./shared";

export interface GoleCellOptions extends GoleAdapterOptions {
  /** Class of the element the renderer returns. Default `"gole-cell"`. */
  cellClass?: string;
}

/**
 * A cell renderer that shows the cell value in Gole. Cells are DOM, so only the
 * digits get the Gole font (`<span class="gole">`); signs, separators and currency
 * signs keep the grid's font. The number carries `role="img"` and an `aria-label`
 * with the decimal text. Cell values are escaped, never inserted as HTML.
 *
 * ```ts
 * const columnDefs = [{ field: "amount", cellRenderer: goleCellRenderer({ decimals: 2 }) }];
 * ```
 */
export function goleCellRenderer<TData = any, TValue = any>(
  options: GoleCellOptions = {},
): (params: Pick<ICellRendererParams<TData, TValue>, "value">) => HTMLElement {
  const { cellClass = "gole-cell", ...rest } = options;
  const format = createGoleAdapterFormat(rest);
  return (params) => {
    const element = document.createElement("span");
    element.className = cellClass;
    const value: unknown = params.value;
    if (value == null || value === "") return element;
    // Core escapes every piece of text it puts into this string.
    element.innerHTML = format.html(value);
    // Without `format`, core labels the digits but leaves a sign outside; label the whole number here.
    if (!rest.format && format.isNumber(value)) {
      element.setAttribute("role", "img");
      element.setAttribute("aria-label", format.label(value));
    }
    return element;
  };
}

/**
 * AG Grid comparator: sorts by decimal value, exactly, for numbers, bigints, long
 * numeric strings and Gole text. Empty cells come first.
 */
export function goleComparator(valueA: unknown, valueB: unknown): number {
  return compareGole(valueA, valueB);
}

/**
 * A column definition fragment for a numeric Gole column: the cell renderer,
 * right alignment, a numeric comparator and a `valueFormatter` that gives the plain
 * decimal text (used for CSV export, the clipboard and text filters).
 *
 * ```ts
 * const columnDefs = [
 *   { field: "item" },
 *   { field: "amount", ...goleColDef({ decimals: 2 }) },
 *   { field: "price", ...goleColDef({ format: { locale: "en-IN", style: "currency", currency: "INR" } }) },
 * ];
 * ```
 */
export function goleColDef<TData = any, TValue = any>(
  options: GoleCellOptions = {},
): Pick<ColDef<TData, TValue>, "cellRenderer" | "valueFormatter" | "comparator" | "cellClass" | "headerClass"> {
  const { cellClass: _cellClass, ...rest } = options;
  const format = createGoleAdapterFormat(rest);
  return {
    cellRenderer: goleCellRenderer<TData, TValue>(options),
    valueFormatter: (params: ValueFormatterParams<TData, TValue>) => {
      const value: unknown = params.value;
      return value == null || value === "" ? "" : format.label(value);
    },
    comparator: goleComparator,
    cellClass: "ag-right-aligned-cell",
    headerClass: "ag-right-aligned-header",
  };
}
