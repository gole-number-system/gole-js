import { useState } from "react";
import { goleCount, toGole } from "@gole-number-system/gole-core";
import { Gole, GoleInput, GolePairs } from "@gole-number-system/react-gole";

const samples = ["7", "35", "123", "2026", "100000", "12.5", "0.375", "-4.5", "1863486135148634156"];

/** Type a number: see the padded text, the pairs and the symbols. */
export function Basics() {
  const [value, setValue] = useState("123.5");
  const shown = /\d/.test(value) ? value : "0";

  return (
    <>
      <label className="field">
        <span>Decimal number</span>
        <GoleInput value={value} onValueChange={setValue} allowNegative className="input" />
      </label>

      <GolePairs value={shown} className="pairs" />
      <p className="note">
        Dashed boxes hold a padding zero: on the left for the whole part, on the right for the fraction. The text
        behind the symbols is <code>{toGole(shown)}</code>: {shown.replace(/\D/g, "").length} digits become{" "}
        {goleCount(shown)} symbols.
      </p>

      <table className="grid">
        <thead>
          <tr>
            <th>Decimal</th>
            <th>
              <code>toGole()</code>
            </th>
            <th>Gole</th>
          </tr>
        </thead>
        <tbody>
          {samples.map((sample) => (
            <tr key={sample}>
              <td>{sample}</td>
              <td>
                <code>{toGole(sample)}</code>
              </td>
              <td className="big">
                <Gole value={sample} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
