import { type ExperienceItem } from "@/lib/parser/homepage";
import { renderMDX } from "@/lib/mdx/processor";
import { ExperienceCard } from "./experience-card";

export async function ExperienceSection({
  heading,
  items,
}: {
  heading: string;
  items: ExperienceItem[];
}) {
  const renderedItems = await Promise.all(
    items.map(async (item) => ({
      role: item.role,
      company: item.company,
      period: item.period,
      descriptionContent: item.description
        ? await renderMDX(item.description)
        : null,
    }))
  );

  return (
    <section className="py-8">
      <h2 className="text-lg font-semibold tracking-tight mb-6">{heading}</h2>
      <div className="relative space-y-8 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-border">
        {renderedItems.map((item, i) => (
          <ExperienceCard key={i} item={item} />
        ))}
      </div>
    </section>
  );
}
