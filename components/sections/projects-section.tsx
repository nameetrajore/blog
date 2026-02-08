import Image from "next/image";
import { type ProjectItem } from "@/lib/parser/homepage";
import { Badge } from "@/components/ui/badge";

export function ProjectsSection({
  heading,
  items,
}: {
  heading: string;
  items: ProjectItem[];
}) {
  return (
    <section className="py-8">
      <h2 className="text-lg font-semibold tracking-tight mb-6">{heading}</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {items.map((project) => (
          <a
            key={project.title}
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            {project.image && (
              <div className="overflow-hidden rounded-lg mb-3 bg-muted">
                <Image
                  src={project.image}
                  alt={project.title}
                  width={600}
                  height={340}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            )}
            <h3 className="font-medium inline-block bg-gradient-to-r from-foreground to-foreground bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-300 group-hover:bg-[length:100%_1px]">
              {project.title}
            </h3>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {project.description}
              </p>
            )}
            {project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </a>
        ))}
      </div>
    </section>
  );
}
