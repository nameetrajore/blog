import { renderMDX } from "@/lib/mdx/processor";
import { IntroAnimation } from "./intro-animation";

export async function IntroSection({
  name,
  subtitle,
  raw,
}: {
  name: string;
  subtitle: string;
  raw: string;
}) {
  const content = raw ? await renderMDX(raw) : null;
  return (
    <section className="pt-16 pb-8 md:pt-24 md:pb-8">
      <div className="max-w-2xl">
        <IntroAnimation name={name} subtitle={subtitle} />
        {content && <div className="mt-6">{content}</div>}
      </div>
    </section>
  );
}
