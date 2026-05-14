import React from "react";
import { Button } from "./Button";

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null; info?: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("UI crashed:", error, info);
    this.setState({ info: info.componentStack });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-rose-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="text-lg font-semibold text-slate-900">Something went wrong</div>
        <div className="mt-2 text-sm text-slate-700">
          A UI error happened while rendering this page. Open Chrome DevTools → Console for details.
        </div>
        <div className="mt-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">
          {this.state.error.message}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              window.location.reload();
            }}
          >
            Reload
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              this.setState({ error: null, info: undefined });
            }}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }
}

