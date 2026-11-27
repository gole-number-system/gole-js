import { Gole, GoleText, GoleTime } from "@gole-number-system/react-gole";

const departures = [
  { time: "06:05", train: "12723", to: "New Delhi", platform: 1, delay: 0 },
  { time: "07:40", train: "17031", to: "Mumbai CSMT", platform: 10, delay: 12 },
  { time: "09:15", train: "12604", to: "Chennai Central", platform: 4, delay: 0 },
  { time: "21:50", train: "22691", to: "Bengaluru", platform: 7, delay: 5 },
];

/** A departure board: times, train numbers and platforms. */
export function Departures() {
  return (
    <div className="board">
      <p className="board-clock">
        <span>Now</span>
        <GoleTime />
      </p>
      <table className="grid">
        <thead>
          <tr>
            <th>Time</th>
            <th>Train</th>
            <th>To</th>
            <th className="num">Platform</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {departures.map((row) => (
            <tr key={row.train}>
              <td className="big">
                <GoleText>{row.time}</GoleText>
              </td>
              <td>
                <Gole value={row.train} />
              </td>
              <td>{row.to}</td>
              <td className="num">
                <Gole value={row.platform} />
              </td>
              <td>
                {row.delay ? (
                  <>
                    Late <Gole value={row.delay} /> min
                  </>
                ) : (
                  "On time"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
