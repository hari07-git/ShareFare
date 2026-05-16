import React from "react";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input(props, ref) {
    return (
      <input
        ref={ref}
        {...props}
        className={`w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none shadow-[0_18px_60px_-45px_rgba(2,6,23,0.6)] backdrop-blur focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/25 ${
          props.className ?? ""
        }`}
      />
    );
  }
);
