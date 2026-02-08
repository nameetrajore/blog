export type IntroSection = {
  type: "intro";
  name: string;
  subtitle: string;
  raw: string;
};

export type ProjectItem = {
  title: string;
  description: string;
  tags: string[];
  link?: string;
  image?: string;
};

export type ProjectsSection = {
  type: "projects";
  heading: string;
  items: ProjectItem[];
};

export type ExperienceItem = {
  role: string;
  company: string;
  period: string;
  description: string;
};

export type ExperienceSection = {
  type: "experience";
  heading: string;
  items: ExperienceItem[];
};

export type BlogsSection = {
  type: "blogs";
  heading: string;
};

export type DefaultSection = {
  type: "default";
  heading: string;
  raw: string;
};

export type HomepageSection =
  | IntroSection
  | ProjectsSection
  | ExperienceSection
  | BlogsSection
  | DefaultSection;

export function parseHomepage(markdown: string): HomepageSection[] {
  const sections: HomepageSection[] = [];

  // Strip HTML comments before parsing
  const cleaned = markdown.replace(/<!--[\s\S]*?-->/g, "");

  // Split on ## headings, keeping the heading text
  const parts = cleaned.split(/^## /m);

  // First part is content before any ## heading (intro)
  const introPart = parts[0].trim();
  if (introPart) {
    const introLines = introPart.split("\n").filter((l) => l.trim());
    const nameMatch = introLines[0]?.match(/^#\s+(.+)$/);
    const name = nameMatch ? nameMatch[1].trim() : "";
    const subtitle = introLines[1]?.trim() ?? "";
    // Remaining lines after name and subtitle
    const remaining = introLines.slice(name ? (subtitle ? 2 : 1) : 0).join("\n");
    sections.push({ type: "intro", name, subtitle, raw: remaining });
  }

  // Remaining parts are ## sections
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const newlineIndex = part.indexOf("\n");
    const heading =
      newlineIndex === -1 ? part.trim() : part.slice(0, newlineIndex).trim();
    const body = newlineIndex === -1 ? "" : part.slice(newlineIndex + 1).trim();
    const headingLower = heading.toLowerCase();

    if (headingLower === "projects") {
      sections.push({
        type: "projects",
        heading,
        items: parseProjectItems(body),
      });
    } else if (headingLower === "experience") {
      sections.push({
        type: "experience",
        heading,
        items: parseExperienceItems(body),
      });
    } else if (headingLower === "blogs" || headingLower === "blog") {
      sections.push({ type: "blogs", heading });
    } else {
      sections.push({ type: "default", heading, raw: body });
    }
  }

  return sections;
}

function parseProjectItems(body: string): ProjectItem[] {
  const items: ProjectItem[] = [];
  const blocks = body.split(/^### /m).filter((b) => b.trim());

  for (const block of blocks) {
    const lines = block.split("\n");
    const title = lines[0].trim();

    let description = "";
    const tags: string[] = [];
    let link: string | undefined;
    let image: string | undefined;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Extract markdown image ![alt](url)
      const imageMatch = line.match(/^!\[[^\]]*\]\(([^)]+)\)$/);
      if (imageMatch) {
        image = imageMatch[1];
        continue;
      }

      // Extract inline code as tags
      const tagMatches = line.match(/`([^`]+)`/g);
      if (tagMatches && tagMatches.length > 0 && line.replace(/`[^`]+`/g, "").trim() === "") {
        tags.push(...tagMatches.map((t) => t.replace(/`/g, "")));
        continue;
      }

      // Extract markdown links
      const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch && line.replace(/\[[^\]]+\]\([^)]+\)/, "").trim() === "") {
        link = linkMatch[2];
        continue;
      }

      // Everything else is description
      if (description) description += " ";
      description += line;
    }

    items.push({ title, description, tags, link, image });
  }

  return items;
}

function parseExperienceItems(body: string): ExperienceItem[] {
  const items: ExperienceItem[] = [];
  const blocks = body.split(/^### /m).filter((b) => b.trim());

  for (const block of blocks) {
    const lines = block.split("\n");
    const heading = lines[0].trim();

    // Parse "Role @ Company" pattern
    const atMatch = heading.match(/^(.+?)\s*@\s*(.+)$/);
    const role = atMatch ? atMatch[1].trim() : heading;
    const company = atMatch ? atMatch[2].trim() : "";

    let period = "";
    let description = "";

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Extract italic text as period (e.g. *2023-Present*)
      const italicMatch = line.match(/^\*([^*]+)\*$/);
      if (italicMatch && !period) {
        period = italicMatch[1];
        continue;
      }

      if (description) description += "\n";
      description += line;
    }

    items.push({ role, company, period, description });
  }

  return items;
}
