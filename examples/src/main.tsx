import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// One import loads the GoleStandard font (Ligature build) and the component styles.
import "@gole-number-system/react-gole/styles.css";
import "./styles.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
