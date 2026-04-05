function TickMarks() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 260 140"
      className="pointer-events-none absolute -right-14 -top-8 h-[120px] w-[220px] opacity-70"
    >
      <g stroke="#202020" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M194 10 206 24" />
        <path d="M223 24 239 38" />
        <path d="M204 44 214 58" />
        <path d="M230 65 247 80" />
        <path d="M198 102 208 116" />
      </g>
    </svg>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen px-4 py-10 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col items-center justify-center gap-10">
        <div className="relative text-center">
          <TickMarks />
          <h1 className="app-title text-[3.8rem] leading-[0.75] tracking-[-0.09em] sm:text-[4.25rem]">
            TO-DO
          </h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-[1.35] text-[var(--text-body)] sm:text-base">
            gamble and trade cards and finally
            <br />
            get some s*** done for once
          </p>
        </div>

        <section className="app-panel w-full max-w-[795px] p-5 sm:p-7">
          <form action="/create" method="GET" className="flex flex-col gap-5">
            <div>
              <p className="app-kicker">Quick Start</p>
              <p className="mt-2 text-sm leading-[1.45] text-[rgba(32,32,32,0.62)]">
                Start with your task list, then tune players, rarities, and pack
                settings on the next screen.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-[1fr_172px] md:items-end">
              <label className="flex flex-col gap-2">
                <span className="app-label">Enter your chores</span>
                <textarea
                  name="tasks"
                  className="app-textarea"
                  placeholder={"Clean the kitchen\nReply to invoices\nFinish sprint review"}
                  defaultValue=""
                />
              </label>

              <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-2">
                  <span className="app-label">How many players</span>
                  <input
                    name="players"
                    className="app-input"
                    type="number"
                    min={1}
                    max={20}
                    defaultValue={3}
                  />
                </label>

                <button
                  type="submit"
                  className="app-button justify-center text-center text-[1.05rem]"
                >
                  Generates Cards →
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
