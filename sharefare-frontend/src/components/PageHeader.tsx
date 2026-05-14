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
    <section className="overflow-hidden rounded-2xl border border-white/60 bg-white/60 shadow-sm backdrop-blur">
      <div className="relative grid items-stretch md:grid-cols-5">
        <div className="relative md:col-span-3">
          <div className="p-6 md:p-8">
            <div className="text-2xl font-semibold leading-tight text-slate-900 md:text-3xl">{title}</div>
            {subtitle ? <div className="mt-2 text-sm text-slate-700">{subtitle}</div> : null}
            {right ? <div className="mt-5">{right}</div> : null}
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/70 via-white/20 to-transparent" />
        </div>
        <div className="relative hidden md:col-span-2 md:block">
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
        </div>
      </div>
    </section>
  );
}

