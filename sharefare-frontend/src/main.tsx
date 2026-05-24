import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./state/auth";
import { initMonitoring, Sentry } from "./lib/monitoring";

initMonitoring();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<div className="p-6 text-sm text-slate-600">ShareFare hit a temporary UI issue. Please reload.</div>}>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
