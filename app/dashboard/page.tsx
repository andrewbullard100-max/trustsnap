import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createSpace } from "@/lib/actions/spaces";
import { signOut } from "@/lib/actions/auth";

export default async function DashboardPage(props: PageProps<"/dashboard">) {
  const params = await props.searchParams;
  const error = typeof params.error === "string" ? params.error : null;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: spaces } = await supabase
    .from("spaces")
    .select("id, name, slug, plan")
    .eq("owner_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your spaces</h1>
        <form action={signOut}>
          <button className="text-sm text-slate-500 hover:text-slate-800">Log out</button>
        </form>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}

      <ul className="mt-8 space-y-3">
        {(spaces ?? []).map((s) => (
          <li key={s.id}>
            <Link
              href={`/dashboard/${s.id}`}
              className="flex items-center justify-between rounded-xl border border-slate-200 px-5 py-4 hover:border-slate-300"
            >
              <span className="font-medium">{s.name}</span>
              <span className="text-xs uppercase tracking-wide text-slate-400">{s.plan}</span>
            </Link>
          </li>
        ))}
        {(spaces ?? []).length === 0 && (
          <p className="text-sm text-slate-500">No spaces yet — create your first one below.</p>
        )}
      </ul>

      <div className="mt-10 rounded-xl border border-dashed border-slate-300 p-6">
        <h2 className="font-semibold">Create a space</h2>
        <form action={createSpace} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Product / brand name
            </label>
            <input
              name="name"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Acme Widgets"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Question to ask customers
            </label>
            <input
              name="question"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="What do you love most about us?"
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-500"
          >
            Create space
          </button>
        </form>
      </div>
    </div>
  );
}
