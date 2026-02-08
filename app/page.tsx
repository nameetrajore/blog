import { getHomepage } from "@/lib/s3/content";
import { parseHomepage } from "@/lib/parser/homepage";
import { IntroSection } from "@/components/sections/intro-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { ExperienceSection } from "@/components/sections/experience-section";
import { BlogSection } from "@/components/sections/blog-section";
import { DefaultSection } from "@/components/sections/default-section";
import { Footer } from "@/components/layout/footer";
import { PageTransition } from "@/components/layout/page-transition";

export const dynamic = "force-dynamic";

export default async function Page() {
  const raw = await getHomepage();
  const sections = parseHomepage(raw);

  const hasBlogsSection = sections.some((s) => s.type === "blogs");

  return (
    <main className="mx-auto max-w-2xl px-6">
      <PageTransition>
        {sections.map((section, i) => {
          switch (section.type) {
            case "intro":
              return <IntroSection key={i} name={section.name} subtitle={section.subtitle} raw={section.raw} />;
            case "projects":
              return (
                <ProjectsSection
                  key={i}
                  heading={section.heading}
                  items={section.items}
                />
              );
            case "experience":
              return (
                <ExperienceSection
                  key={i}
                  heading={section.heading}
                  items={section.items}
                />
              );
            case "blogs":
              return <BlogSection key={i} heading={section.heading} />;
            case "default":
              return (
                <DefaultSection
                  key={i}
                  heading={section.heading}
                  raw={section.raw}
                />
              );
          }
        })}
        {!hasBlogsSection && <BlogSection heading="Blogs" />}
        <Footer />
      </PageTransition>
    </main>
  );
}
