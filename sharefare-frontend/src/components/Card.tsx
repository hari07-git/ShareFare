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
        "rounded-3xl border border-white/12 bg-white/8 p-5 text-slate-100 shadow-[0_30px_90px_-55px_rgba(2,6,23,0.65)] backdrop-blur-xl",
        className
      )}
    >
      {title ? (
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {subtitle ? <div className="mt-1 text-sm text-slate-300">{subtitle}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
