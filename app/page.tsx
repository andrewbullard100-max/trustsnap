import Link from "next/link";

const FEATURES = [
  {
    title: "No site slowdown",
    body: "Lightweight embeds — not the bloated widgets that tank your Lighthouse score.",
  },
  {
    title: "Text or video, customer's choice",
    body: "Plenty of people won't record a video. Don't lose their testimonial because your tool forces one format.",
  },
  {
    title: "One link, zero friction",
    body: "Customers submit without creating an account. More asks answered, less follow-up chasing.",
  },
  {
    title: "Priced for small teams",
    body: "$29/month, flat. No surprise tier jumps, no $1,000/mo integration upsells.",
  },
];

const STEPS = [
  {
    n: 1,
    title: "Create a space",
    body: "One space per product or brand. Set your question and brand color.",
  },
  {
    n: 2,
    title: "Share your link",
    body: "Send it in a follow-up email, a receipt, or a thank-you page.",
  },
  {
    n: 3,
    title: "Approve & embed",
    body: "Review submissions, feature the best ones, paste one snippet on your site.",
  },
];

export default function Home() {
  return (
    <div className="flex-1">
      <header className="border-b border-slate-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="text-lg font-semibold tracking-tight">TrustSnap</span>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/login" className="text-slate-600 hover:text-slate-900">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500"
            >
              Start free
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-16 pt-20 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Turn happy customers into your best sales page.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          Send one link, collect text or video testimonials with zero friction for your
          customer, and embed a fast, good-looking wall of love on your site in minutes.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            href="/signup"
            className="rounded-full bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-500"
          >
            Start free — no card required
          </Link>
          <p className="text-sm text-slate-500">
            Free plan: up to 5 testimonials shown. Pro is $29/month.
          </p>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-center text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Built around what&apos;s actually annoying about testimonial tools
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title}>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-2xl font-semibold">How it works</h2>
        <div className="mt-10 grid gap-10 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="text-center">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white">
                {s.n}
              </div>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-center text-2xl font-semibold">What customers say</h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            This is a new product — this section fills in with real, approved testimonials as
            they come in.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-center text-sm text-slate-400"
              >
                Your customer&apos;s testimonial will appear here
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-center text-2xl font-semibold">Simple pricing</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-8">
            <h3 className="font-semibold">Free</h3>
            <p className="mt-2 text-3xl font-semibold">$0</p>
            <ul className="mt-6 space-y-2 text-sm text-slate-600">
              <li>1 space</li>
              <li>Up to 5 approved testimonials shown</li>
              <li>Text + video collection</li>
              <li>Embeddable wall of love</li>
            </ul>
            <Link
              href="/signup"
              className="mt-8 block rounded-full border border-slate-300 px-4 py-2 text-center font-medium hover:border-slate-400"
            >
              Start free
            </Link>
          </div>
          <div className="rounded-2xl border border-indigo-600 p-8 shadow-sm">
            <h3 className="font-semibold">Pro</h3>
            <p className="mt-2 text-3xl font-semibold">$29/mo</p>
            <ul className="mt-6 space-y-2 text-sm text-slate-600">
              <li>Unlimited testimonials shown</li>
              <li>Everything in Free</li>
              <li>Priority support from an actual human</li>
            </ul>
            <Link
              href="/signup"
              className="mt-8 block rounded-full bg-indigo-600 px-4 py-2 text-center font-medium text-white hover:bg-indigo-500"
            >
              Start free, upgrade anytime
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-500">
        TrustSnap · Built for solo founders and small teams
      </footer>
    </div>
  );
}
