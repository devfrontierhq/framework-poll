function App() {
  return (
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-cyan-950 to-emerald-950 px-6 py-16 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <section className="rounded-3xl border border-white/15 bg-white/10 p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur">
          <div className="mb-6 inline-flex rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 text-sm font-semibold tracking-[0.2em] text-cyan-100 uppercase">
            Tailwind Check
          </div>
          <h1 className="max-w-3xl text-5xl font-black tracking-tight text-balance sm:text-6xl">
            Framework Poll is rendering with Tailwind CSS.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-200">
            This page intentionally uses gradients, transparency, spacing,
            responsive typography, and grid utilities so style failures are
            obvious immediately.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-400/30 transition hover:-translate-y-0.5 hover:bg-cyan-200">
              Primary Action
            </button>
            <button className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
              Secondary Action
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-amber-300 p-6 text-slate-950 shadow-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.2em]">
              Color
            </p>
            <p className="mt-3 text-2xl font-black">Solid utility backgrounds</p>
          </article>
          <article className="rounded-2xl bg-fuchsia-500 p-6 text-white shadow-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.2em]">
              Layout
            </p>
            <p className="mt-3 text-2xl font-black">Responsive grid columns</p>
          </article>
          <article className="rounded-2xl border border-emerald-200/30 bg-emerald-400/20 p-6 text-white shadow-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.2em]">
              Effects
            </p>
            <p className="mt-3 text-2xl font-black">Blur, opacity, and shadows</p>
          </article>
        </section>
      </div>
    </main>
  )
}

export default App
