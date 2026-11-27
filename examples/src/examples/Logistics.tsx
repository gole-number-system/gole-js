import { useState } from "react";
import { goleCount } from "@gole-number-system/gole-core";
import { Gole, GoleInput, GoleText } from "@gole-number-system/react-gole";

function Label({ title, count, children }: { title: string; count: string; children: React.ReactNode }) {
  return (
    <div className="ship-label">
      <header>
        <span>{title}</span>
        <span>{count}</span>
      </header>
      <div className="ship-number">{children}</div>
      <footer>
        <span>Ship to</span>
        <b>{title === "Gole" ? <GoleText>Hub 500032</GoleText> : "Hub 500032"}</b>
      </footer>
    </div>
  );
}

/** The same tracking number on two labels of the same size. */
export function Logistics() {
  const [tracking, setTracking] = useState("1863486135148634156");
  const digits = tracking || "0";

  return (
    <>
      <label className="field">
        <span>Tracking number</span>
        <GoleInput
          value={tracking}
          onValueChange={(next) => setTracking(next.slice(0, 24))}
          allowDecimal={false}
          className="input"
          wrapperClassName="input-only"
        />
      </label>
      <div className="two-up">
        <Label title="Decimal" count={`${digits.length} digits`}>
          <span className="mono">{digits}</span>
        </Label>
        <Label title="Gole" count={`${goleCount(digits)} symbols`}>
          <Gole value={digits} />
        </Label>
      </div>
    </>
  );
}
