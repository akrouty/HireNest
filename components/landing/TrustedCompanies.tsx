const companies = ["NOVA", "APEX", "CLOUDLY", "VECTOR", "QUANTUM"];

export function TrustedCompanies() {
  return (
    <section className="border-y border-slate-200 bg-slate-50 py-10">
      <div className="container mx-auto px-4">
        <p className="text-center text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
          Trusted by leading tech teams
        </p>
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {companies.map((company) => (
            <div
              key={company}
              className="flex h-16 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-bold tracking-[0.18em] text-slate-400 shadow-sm"
            >
              {company}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
