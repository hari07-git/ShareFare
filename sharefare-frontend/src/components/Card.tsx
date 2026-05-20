import { cn } from "../lib/cn";

export function Card({
  title,
  subtitle,
  children,
  className
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm transition duration-300 hover:border-slate-200",
        className
      )}
    >
      {title ? (
        <div className="mb-4">
          <h2 className="text-base font-semibold tracking-tight text-slate-950">{title}</h2>
          {subtitle ? <div className="mt-1 text-sm leading-relaxed text-slate-500">{subtitle}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
