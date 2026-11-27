import { forwardRef, useState, type ChangeEvent, type InputHTMLAttributes } from "react";
import type { GoleBuild } from "@gole-number-system/gole-core";
import { Gole } from "./Gole";
import { cx } from "./render";

export interface GoleInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "type"> {
  /** Controlled value: a decimal string such as `"123.5"`. */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  /** Called with the cleaned decimal string on every edit. */
  onValueChange?: (value: string) => void;
  /** Allow a decimal point. Default `true`. */
  allowDecimal?: boolean;
  /** Allow a leading minus sign. Default `false`. */
  allowNegative?: boolean;
  build?: GoleBuild;
  /** Class of the wrapping element. `className` goes to the `<input>`. */
  wrapperClassName?: string;
}

function clean(raw: string, allowDecimal: boolean, allowNegative: boolean): string {
  const sign = allowNegative && /^\s*[-−]/.test(raw) ? "-" : "";
  let digits = raw.replace(allowDecimal ? /[^\d.]/g : /\D/g, "");
  const dot = digits.indexOf(".");
  if (dot !== -1) digits = digits.slice(0, dot + 1) + digits.slice(dot + 1).replace(/\./g, "");
  return sign + digits;
}

/**
 * A number field with a live Gole preview next to it.
 *
 * People type ordinary decimal digits. The field itself is not set in the Gole font,
 * because a half-typed number has an odd digit count and would show a misleading
 * symbol; the preview always shows the correctly padded number.
 *
 * ```tsx
 * const [amount, setAmount] = useState("123.5");
 * <GoleInput value={amount} onValueChange={setAmount} aria-label="Amount" />
 * ```
 */
export const GoleInput = forwardRef<HTMLInputElement, GoleInputProps>(function GoleInput(
  {
    value,
    defaultValue = "",
    onValueChange,
    allowDecimal = true,
    allowNegative = false,
    build,
    wrapperClassName,
    ...rest
  },
  ref,
) {
  const [inner, setInner] = useState(() => clean(defaultValue, allowDecimal, allowNegative));
  const current = value ?? inner;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = clean(event.target.value, allowDecimal, allowNegative);
    if (value === undefined) setInner(next);
    onValueChange?.(next);
  };

  return (
    <span className={cx("gole-input", wrapperClassName)}>
      <input
        ref={ref}
        type="text"
        inputMode={allowDecimal ? "decimal" : "numeric"}
        autoComplete="off"
        {...rest}
        value={current}
        onChange={handleChange}
      />
      <output className="gole-input-preview">{/\d/.test(current) && <Gole value={current} build={build} />}</output>
    </span>
  );
});
