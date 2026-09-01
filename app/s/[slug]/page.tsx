import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SubmitForm from "./SubmitForm";

export default async function SubmitPage(props: PageProps<"/s/[slug]">) {
  const { slug } = await props.params;
  const supabase = await createClient();

  const { data: space } = await supabase.from("spaces").select("*").eq("slug", slug).single();
  if (!space) notFound();

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
      <h1 className="text-center text-2xl font-semibold">
        {space.headline || `What our customers say about ${space.name}`}
      </h1>
      {space.question && (
        <p className="mt-2 text-center text-slate-600">{space.question}</p>
      )}
      <div className="mt-8 rounded-2xl border border-slate-200 p-6">
        <SubmitForm space={space} />
      </div>
    </div>
  );
}
