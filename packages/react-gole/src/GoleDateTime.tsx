import { forwardRef, useEffect, useState, type TimeHTMLAttributes } from "react";
import { formatDatePattern, goleSegments, type GoleBuild } from "@gole-number-system/gole-core";
import { useGoleOptions } from "./context";
import { renderFlat } from "./render";

type DateInput = Date | number | string;

const toDate = (value: DateInput) => (value instanceof Date ? value : new Date(value));

interface DateTimeBaseProps extends Omit<TimeHTMLAttributes<HTMLTimeElement>, "children"> {
  /** Pattern of tokens, see `formatDatePattern`. */
  format?: string;
  /** Read the date in UTC instead of local time. */
  utc?: boolean;
  build?: GoleBuild;
}

export interface GoleDateProps extends DateTimeBaseProps {
  /** A `Date`, a timestamp or a date string. */
  value: DateInput;
}

/**
 * A date in Gole inside a `<time>` element. Day, month and each half of the year
 * are one symbol each: `<GoleDate value="2026-11-20" />` shows `[20]/[11]/[20][26]`.
 * Default format `"DD/MM/YYYY"`.
 */
export const GoleDate = forwardRef<HTMLTimeElement, GoleDateProps>(function GoleDate(
  { value, format = "DD/MM/YYYY", utc, build, ...rest },
  ref,
) {
  const options = useGoleOptions({ build, decimalSeparator: false });
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return null;
  const text = formatDatePattern(date, format, utc);
  return (
    <time ref={ref} dateTime={date.toISOString()} aria-label={text} {...rest}>
      {renderFlat(goleSegments(text, options))}
    </time>
  );
});

export interface GoleTimeProps extends DateTimeBaseProps {
  /** A fixed time to show. Leave out for a live clock that shows the current time. */
  value?: DateInput;
  /** How often a live clock updates, in milliseconds. Default `1000`. */
  interval?: number;
}

/**
 * A time of day in Gole: hours, minutes and seconds are one symbol each.
 *
 * ```tsx
 * <GoleTime />                               // live clock, [12]:[05]:[09]
 * <GoleTime value={order.createdAt} format="HH:mm" />
 * ```
 *
 * A live clock renders empty on the server and fills in after hydration.
 * Default format `"HH:mm:ss"`.
 */
export const GoleTime = forwardRef<HTMLTimeElement, GoleTimeProps>(function GoleTime(
  { value, format = "HH:mm:ss", utc, build, interval = 1000, ...rest },
  ref,
) {
  const options = useGoleOptions({ build, decimalSeparator: false });
  const live = value === undefined;
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    if (!live) return;
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(timer);
  }, [live, interval]);

  const date = live ? now : toDate(value);
  if (!date || Number.isNaN(date.getTime())) return live ? <time ref={ref} {...rest} /> : null;
  const text = formatDatePattern(date, format, utc);
  return (
    <time ref={ref} dateTime={date.toISOString()} aria-label={text} {...rest}>
      {renderFlat(goleSegments(text, options))}
    </time>
  );
});
