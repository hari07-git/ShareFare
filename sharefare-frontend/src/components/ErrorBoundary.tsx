import React from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

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
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-xl backdrop-blur-md text-center space-y-6 my-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-inner">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            We hit a small issue loading this page
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed font-semibold">
            Our campus systems encountered an unexpected render crash. This has been logged for admin review.
          </p>
        </div>

        <div className="rounded-xl border border-rose-100 bg-rose-50/20 p-3 text-left font-mono text-[10px] text-rose-700 break-all max-h-36 overflow-y-auto leading-relaxed">
          <strong>Error Details:</strong> {this.state.error.message}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 border-t border-slate-105 pt-5">
          <button
            onClick={() => {
              this.setState({ error: null, info: undefined });
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Try again
          </button>
          
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reload Page
          </button>
          
          <button
            onClick={() => {
              window.location.href = "/";
            }}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-650 px-4 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 transition"
          >
            <Home className="w-3.5 h-3.5" /> Go Home
          </button>
        </div>
      </div>
    );
  }
}
