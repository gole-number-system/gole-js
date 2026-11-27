import { forwardRef, useEffect, useState } from "react";
import { Text, type TextProps } from "react-native";
import { goleDateLabel, goleDateSegments, type GoleDateInput, type GoleDateOptions } from "@gole-number-system/gole-core";
import { useGoleConfig, useGoleFont, type GoleFontProps } from "./context";
import { renderSegments, type GoleComponent, type GoleRef } from "./render";

interface DateTimeBaseProps extends Omit<TextProps, "children">, GoleFontProps {
  /**
   * A pattern of the tokens `YYYY YY MM DD HH hh mm ss A` (literal text in `[brackets]`),
   * or `Intl.DateTimeFormat` options such as `{ dateStyle: "medium" }`.
   */
  format?: GoleDateOptions["format"];
  /** Locale for `Intl.DateTimeFormat` options. Default: from `<GoleProvider>`, otherwise the runtime's locale. */
  locale?: string | string[];
  /** Read the date in UTC instead of local time. */
  utc?: boolean;
}

type DateTextProps = DateTimeBaseProps & { date: GoleDateInput; format: NonNullable<GoleDateOptions["format"]> };

const DateText = forwardRef<GoleRef, DateTextProps>(function DateText(
  { date, format, locale, utc, build, fontFamily, ...rest },
  ref,
) {
  const config = useGoleConfig();
  const font = useGoleFont({ build, fontFamily });
  const options = { format, locale: locale ?? config.locale, utc, build: font.build };
  const label = goleDateLabel(date, options);
  if (!label) return null; // invalid date
  return (
    <Text ref={ref} accessible accessibilityLabel={label} {...rest}>
      {renderSegments(goleDateSegments(date, options), font.fontFamily)}
    </Text>
  );
});

export interface GoleDateProps extends DateTimeBaseProps {
  /** A `Date`, a timestamp or a date string. */
  value: GoleDateInput;
}

/**
 * A date in Gole. Day, month and each half of the year are one symbol each:
 * `<GoleDate value="2026-11-20" />` shows `[20]/[11]/[20][26]`. Default format `"DD/MM/YYYY"`.
 */
export const GoleDate: GoleComponent<GoleDateProps> = forwardRef<GoleRef, GoleDateProps>(function GoleDate({ value, format = "DD/MM/YYYY", ...rest }, ref) {
  return <DateText ref={ref} date={value} format={format} {...rest} />;
});

export interface GoleTimeProps extends DateTimeBaseProps {
  /** A fixed time to show. Leave out for a live clock that shows the current time. */
  value?: GoleDateInput;
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
 * A live clock stops its timer when it unmounts. Default format `"HH:mm:ss"`.
 */
export const GoleTime: GoleComponent<GoleTimeProps> = forwardRef<GoleRef, GoleTimeProps>(function GoleTime(
  { value, format = "HH:mm:ss", interval = 1000, ...rest },
  ref,
) {
  const live = value === undefined;
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!live) return;
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(timer);
  }, [live, interval]);

  return <DateText ref={ref} date={live ? now : value} format={format} {...rest} />;
});
