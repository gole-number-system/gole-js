import { Basics } from "./examples/Basics";
import { Charts } from "./examples/Charts";
import { Components } from "./examples/Components";
import { Departures } from "./examples/Departures";
import { Invoice } from "./examples/Invoice";
import { Logistics } from "./examples/Logistics";

const sections = [
  { id: "basics", title: "Basics", note: "Try a number and see how it is padded and paired.", Example: Basics },
  { id: "components", title: "React components", note: "Everything in @gole-number-system/react-gole.", Example: Components },
  { id: "logistics", title: "Logistics: tracking label", note: "A long identifier takes half the symbols and fits on one line.", Example: Logistics },
  { id: "finance", title: "Finance: invoice", note: "Amounts with two decimals, invoice numbers and dates in a table.", Example: Invoice },
  { id: "transport", title: "Transport: departure board", note: "Hours and minutes are one symbol each; the clock is live.", Example: Departures },
  { id: "charts", title: "Analytics: charts", note: "Recharts axes, tooltips, legends and data labels with @gole-number-system/react-gole-charts.", Example: Charts },
];

export function App() {
  return (
    <main className="page">
      <p className="eyebrow">Gole Number System</p>
      <h1>Examples</h1>
      <p className="lede">
        Gole is a base-100 number system: one symbol for every pair of decimal digits. These examples show how to
        display Gole numbers correctly with the GoleStandard font. Each section's source is one file in{" "}
        <code>src/examples/</code>.
      </p>
      <nav className="toc" aria-label="Examples">
        {sections.map(({ id, title }) => (
          <a href={`#${id}`} key={id}>
            {title}
          </a>
        ))}
        <a href="./vanilla.html">Without a framework →</a>
      </nav>

      {sections.map(({ id, title, note, Example }) => (
        <section className="card" id={id} key={id}>
          <h2>{title}</h2>
          <p className="note">{note}</p>
          <Example />
        </section>
      ))}
    </main>
  );
}
