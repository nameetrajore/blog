import { renderMDX } from "@/lib/mdx/processor";

export async function DefaultSection({
  heading,
  raw,
}: {
  heading: string;
  raw: string;
}) {
  const content = await renderMDX(raw);
  return (
    <section className="py-8">
      <h2 className="text-xl font-semibold tracking-tight mb-6">{heading}</h2>
      <div>{content}</div>
    </section>
  );
}
