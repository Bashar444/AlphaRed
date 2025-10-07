import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./components/ThemeProvider";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light" storageKey="portfolio-theme">
    <App />
  </ThemeProvider>
);
