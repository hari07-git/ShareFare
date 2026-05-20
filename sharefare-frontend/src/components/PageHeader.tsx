export function PageHeader({
  title,
  subtitle,
  imageUrl,
  right
}: {
  title: string;
  subtitle?: string;
  imageUrl: string;
  right?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative grid items-stretch md:grid-cols-12">
        <div className="relative md:col-span-7">
          <div className="p-6 md:p-8">
            <div className="text-2xl font-semibold leading-tight tracking-tight text-slate-950 md:text-3xl">{title}</div>
            {subtitle ? <div className="mt-2 text-sm text-slate-600">{subtitle}</div> : null}
            {right ? <div className="mt-5">{right}</div> : null}
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_90%_at_0%_0%,rgba(79,70,229,0.08),transparent_60%)]" />
        </div>
        <div className="relative hidden md:col-span-5 md:block">
          <img src={imageUrl} alt="" className="h-full w-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/60" />
        </div>
      </div>
    </section>
  );
}
