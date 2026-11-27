import type { ReactNode } from "react";
import {
  Gole,
  GoleCompact,
  GoleCurrency,
  GoleDate,
  GolePercent,
  GoleSymbol,
  GoleText,
  GoleTime,
  GoleUnit,
} from "@gole-number-system/react-gole";

function Row({ code, children }: { code: string; children: ReactNode }) {
  return (
    <tr>
      <td>
        <code>{code}</code>
      </td>
      <td className="big">{children}</td>
    </tr>
  );
}

const orderId = 505;
const days = 3;

/** One row per component. */
export function Components() {
  return (
    <>
      <table className="grid">
        <thead>
          <tr>
            <th>JSX</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          <Row code="<Gole value={987654} />">
            <Gole value={987654} />
          </Row>
          <Row code="<Gole value={12747.2} decimals={2} />">
            <Gole value={12747.2} decimals={2} />
          </Row>
          <Row code="<Gole value={-4.5} />">
            <Gole value={-4.5} /> °C
          </Row>
          <Row code="<Gole value={7} minPairs={3} />">
            <Gole value={7} minPairs={3} />
          </Row>
          <Row code="<GoleText>Invoice 5055-002347, 3 items</GoleText>">
            <GoleText>Invoice 5055-002347, 3 items</GoleText>
          </Row>
          <Row code='<GoleText grouping=",">Total 1,234.5 kg</GoleText>'>
            <GoleText grouping=",">Total 1,234.5 kg</GoleText>
          </Row>
          <Row code="<GoleText>Order <b>{orderId}</b> ships in {days} days</GoleText>">
            <GoleText>
              Order <b>{orderId}</b> ships in {days} days
            </GoleText>
          </Row>
          <Row code='<GoleDate value="2026-11-20" />'>
            <GoleDate value="2026-11-20" />
          </Row>
          <Row code='<GoleDate value="2026-05-01" format="DD.MM.YY" />'>
            <GoleDate value="2026-05-01" format="DD.MM.YY" />
          </Row>
          <Row code="<GoleTime />  (live)">
            <GoleTime />
          </Row>
          <Row code='<GoleTime value={date} format="hh:mm A" />'>
            <GoleTime value={new Date(2026, 10, 20, 21, 5)} format="hh:mm A" />
          </Row>
          <Row code='<GoleCurrency value={1234.5} currency="INR" locale="en-IN" />'>
            <GoleCurrency value={1234.5} currency="INR" locale="en-IN" />
          </Row>
          <Row code="<GolePercent value={0.456} />">
            <GolePercent value={0.456} />
          </Row>
          <Row code='<GoleCompact value={1234567} locale="en-IN" />'>
            <GoleCompact value={1234567} locale="en-IN" />
          </Row>
          <Row code='<GoleUnit value={72} unit="kilogram" />'>
            <GoleUnit value={72} unit="kilogram" />
          </Row>
          <Row code="<GoleSymbol value={35} />">
            <GoleSymbol value={35} />
          </Row>
        </tbody>
      </table>

      <h3>All 100 symbols with &lt;GoleSymbol&gt;</h3>
      <div className="symbols" role="list">
        {Array.from({ length: 100 }, (_, n) => (
          <div className="symbol" role="listitem" key={n}>
            <GoleSymbol value={n} />
            <small>{String(n).padStart(2, "0")}</small>
          </div>
        ))}
      </div>
    </>
  );
}
