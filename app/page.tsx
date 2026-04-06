export default function LandingPage() {
  return (
    <main className="min-h-screen px-4 py-10 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col items-center justify-center gap-10">
        <div className="relative text-center">
          <h1 className="app-title text-[3.8rem] leading-[0.75] tracking-[-0.09em] sm:text-[4.25rem]">
            TO-DO
          </h1>
        </div>

        <section className="app-panel w-full max-w-[795px] p-5 sm:p-7">
          <form action="/create" method="GET" className="flex flex-col gap-5">
            <div className="flex flex-col gap-5">
              <label className="flex flex-col gap-2">
                <span className="app-label">Enter your tasks</span>
                <textarea
                  name="tasks"
                  className="app-textarea"
                  placeholder={"Clean the kitchen\nReply to invoices\nFinish sprint review"}
                  defaultValue=""
                  required
                />
              </label>

              <button
                type="submit"
                className="app-button w-full justify-center text-center text-[1.05rem]"
              >
                Continue →
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
