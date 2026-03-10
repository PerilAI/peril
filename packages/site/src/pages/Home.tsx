export function Home() {
  return (
    <>
      {/* Hero — full implementation in PER-47 */}
      <section className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 pt-16">
        <h1 className="max-w-3xl text-center font-display text-5xl leading-tight tracking-tight text-(--fg) sm:text-6xl md:text-7xl">
          Point at the bug.{" "}
          <span className="text-accent-500">Your agent fixes it.</span>
        </h1>
        <p className="mt-6 max-w-xl text-center text-lg text-(--fg-secondary)">
          Visual feedback your coding agents understand. Click any element, add
          your comment, and your AI agent receives structured locators,
          screenshots, and context via MCP.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="#get-started"
            className="glow rounded-lg bg-accent-500 px-6 py-3 text-base font-semibold text-surface-950 transition-all hover:bg-accent-400"
          >
            Try Peril Free
          </a>
          <a
            href="#how-it-works"
            className="rounded-lg border border-(--border) px-6 py-3 text-base font-semibold text-(--fg) transition-all hover:border-accent-500 hover:text-accent-500"
          >
            See How It Works
          </a>
        </div>
      </section>

      {/* How It Works — placeholder for PER-48+ */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-center font-display text-3xl text-(--fg) sm:text-4xl">
          How it works
        </h2>
        <div className="mt-16 grid gap-12 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Annotate",
              desc: "Click any element in your live app. Peril captures locators, a screenshot, and DOM context.",
            },
            {
              step: "2",
              title: "Structure",
              desc: "Your comment becomes a structured task with multi-strategy locators and acceptance criteria.",
            },
            {
              step: "3",
              title: "Execute",
              desc: "Your AI coding agent receives the task via MCP — ready to find, fix, and verify.",
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-500/10 text-lg font-bold text-accent-500">
                {item.step}
              </div>
              <h3 className="mt-4 font-display text-xl text-(--fg)">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-(--fg-secondary)">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Get Started */}
      <section
        id="get-started"
        className="mx-auto max-w-3xl px-6 py-24 text-center"
      >
        <h2 className="font-display text-3xl text-(--fg) sm:text-4xl">
          Get started in minutes
        </h2>
        <div className="mt-8 overflow-hidden rounded-lg border border-(--border) bg-(--bg-secondary) p-6 text-left">
          <code className="block font-mono text-sm text-(--fg-secondary)">
            <span className="text-(--fg-muted)">$</span>{" "}
            <span className="text-accent-500">npm install</span> @peril/react
          </code>
        </div>
      </section>
    </>
  );
}
