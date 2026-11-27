import { Gole, GoleDate, GoleText } from "@gole-number-system/react-gole";

const lines = [
  { item: "Steel coil, 1.2 mm", quantity: 12, rate: 4250.5 },
  { item: "Freight, zone 4", quantity: 1, rate: 18400 },
  { item: "Pallets", quantity: 36, rate: 349.99 },
];
const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.rate, 0);
const tax = subtotal * 0.18;

/** An invoice: every amount keeps two decimals, so the columns line up. */
export function Invoice() {
  return (
    <div className="invoice">
      <p className="invoice-head">
        <GoleText>Invoice 5055-002347</GoleText>
        <GoleDate value={new Date(2026, 10, 20)} />
      </p>
      <table className="grid">
        <thead>
          <tr>
            <th>Item</th>
            <th className="num">Qty</th>
            <th className="num">Rate</th>
            <th className="num">Amount</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.item}>
              <td>
                {/* Descriptions can hold numbers too. */}
                <GoleText>{line.item}</GoleText>
              </td>
              <td className="num">
                <Gole value={line.quantity} />
              </td>
              <td className="num">
                <Gole value={line.rate} decimals={2} />
              </td>
              <td className="num">
                <Gole value={line.quantity * line.rate} decimals={2} />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3}>Subtotal</td>
            <td className="num">
              <Gole value={subtotal} decimals={2} />
            </td>
          </tr>
          <tr>
            <td colSpan={3}>
              Tax <Gole value={18} />%
            </td>
            <td className="num">
              <Gole value={tax} decimals={2} />
            </td>
          </tr>
          <tr className="total">
            <td colSpan={3}>Total (₹)</td>
            <td className="num">
              <Gole value={subtotal + tax} decimals={2} />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
