
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";

  // Re-enable MSW in development to work without a real backend
  async function enableMocking() {
    if (import.meta.env.DEV) {
      const { worker } = await import('./mocks/browser');
      return worker.start({ onUnhandledRequest: 'bypass' });
    }
  }

  enableMocking().then(() => {
    createRoot(document.getElementById("root")!).render(<App />);
  });
  