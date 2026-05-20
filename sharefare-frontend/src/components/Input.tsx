import React from "react";
import { cn } from "../lib/cn";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        {...props}
        className={cn(
          "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-950 outline-none shadow-sm transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70",
          className
        )}
      />
    );
  }
);
