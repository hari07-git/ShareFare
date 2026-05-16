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
    <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#060a12]/55 shadow-[0_60px_160px_-120px_rgba(2,6,23,0.9)] backdrop-blur-xl">
      <div className="relative grid items-stretch md:grid-cols-12">
        <div className="relative md:col-span-7">
          <div className="p-6 md:p-8">
            <div className="text-2xl font-semibold leading-tight tracking-tight text-white md:text-3xl">{title}</div>
            {subtitle ? <div className="mt-2 text-sm text-slate-300/90">{subtitle}</div> : null}
            {right ? <div className="mt-5">{right}</div> : null}
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_90%_at_0%_0%,rgba(34,211,238,0.18),transparent_60%)]" />
        </div>
        <div className="relative hidden md:col-span-5 md:block">
          <img src={imageUrl} alt="" className="h-full w-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#060a12]/70 via-[#060a12]/15 to-transparent" />
        </div>
      </div>
    </section>
  );
}
