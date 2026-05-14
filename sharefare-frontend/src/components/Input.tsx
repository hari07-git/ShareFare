import React from "react";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input(props, ref) {
    return (
      <input
        ref={ref}
        {...props}
        className={`w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm outline-none shadow-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 ${
          props.className ?? ""
        }`}
      />
    );
  }
);
