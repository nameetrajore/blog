import { compileMDX } from "next-mdx-remote/rsc";
import {
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
  isValidElement,
  Children,
} from "react";
import { CopyButton } from "@/components/copy-button";
import { Mermaid } from "@/components/mermaid";
import { Lightbox } from "@/components/lightbox";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkGithubBlockquoteAlert from "remark-github-blockquote-alert";

type El<T extends keyof React.JSX.IntrinsicElements> =
  ComponentPropsWithoutRef<T>;

function extractText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node) return "";
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement(node)) {
    const el = node as ReactElement<{ children?: ReactNode }>;
    return extractText(el.props.children);
  }
  return "";
}

const mdxComponents = {
  h1: (props: El<"h1">) => (
    <h1 className="text-xl font-light tracking-tight mb-4" {...props} />
  ),
  h2: (props: El<"h2">) => (
    <h2 className="text-lg font-semibold tracking-tight mb-3" {...props} />
  ),
  h3: (props: El<"h3">) => (
    <h3 className="text-base font-medium mb-2" {...props} />
  ),
  p: (props: El<"p">) => (
    <p
      className="text-sm text-muted-foreground leading-relaxed mb-4"
      {...props}
    />
  ),
  a: (props: El<"a">) => (
    <a
      className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  img: ({ alt, src, ...rest }: El<"img">) => {
    const isFullWidth = alt?.endsWith("|full") ?? false;
    const caption = isFullWidth ? alt!.slice(0, -5).trim() : alt;
    return (
      <span className={`block ${isFullWidth ? "-mx-6 md:-mx-16 mb-4" : "mb-4"}`}>
        <Lightbox src={typeof src === "string" ? src : undefined}>
          <img
            alt={caption}
            src={src}
            className="rounded-lg w-full bg-white p-2 dark:bg-white/95"
            {...rest}
          />
        </Lightbox>
        {caption && (
          <span className="block text-center text-xs text-muted-foreground mt-2">
            {caption}
          </span>
        )}
      </span>
    );
  },
  code: ({ children, ...rest }: El<"code"> & { "data-language"?: string }) => {
    if (rest["data-language"]) {
      return <code {...rest}>{children}</code>;
    }
    return (
      <code
        className="bg-muted px-1.5 py-0.5 rounded text-[0.8125rem] text-muted-foreground"
        {...rest}
      >
        {children}
      </code>
    );
  },
  pre: ({
    children,
    ...rest
  }: El<"pre"> & { "data-language"?: string }) => {
    const lang = rest["data-language"] ?? "";
    const codeText = extractText(children).replace(/\n+$/, "");
    if (lang === "mermaid") {
      return <Mermaid code={codeText} />;
    }
    return (
      <div className="rounded-lg bg-muted mb-4 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
          <span className="text-xs text-muted-foreground">{lang}</span>
          <CopyButton text={codeText} />
        </div>
        <pre className="p-4 overflow-x-auto leading-relaxed text-[0.8125rem] [&_code]:text-[0.8125rem]" {...rest}>{children}</pre>
      </div>
    );
  },
  table: (props: El<"table">) => (
    <div className="overflow-x-auto mb-4">
      <table
        className="w-full text-sm text-muted-foreground border-collapse"
        {...props}
      />
    </div>
  ),
  thead: (props: El<"thead">) => (
    <thead className="border-b border-border" {...props} />
  ),
  th: (props: El<"th">) => (
    <th
      className="text-left font-semibold text-foreground px-3 py-2"
      {...props}
    />
  ),
  tr: (props: El<"tr">) => (
    <tr className="border-b border-border/50 even:bg-muted/50" {...props} />
  ),
  td: (props: El<"td">) => <td className="px-3 py-2" {...props} />,
  ul: (props: El<"ul">) => (
    <ul
      className="list-disc pl-6 mb-4 space-y-1 text-sm text-muted-foreground"
      {...props}
    />
  ),
  ol: (props: El<"ol">) => (
    <ol
      className="list-decimal pl-6 mb-4 space-y-1 text-sm text-muted-foreground"
      {...props}
    />
  ),
  blockquote: (props: El<"blockquote">) => (
    <blockquote
      className="border-l-2 border-muted-foreground/30 pl-4 italic text-muted-foreground mb-4"
      {...props}
    />
  ),
  hr: () => <hr className="border-border my-8" />,
  iframe: (props: El<"iframe">) => (
    <Lightbox>
      <span className="block mb-4 rounded-lg overflow-hidden aspect-video">
        <iframe
          className="w-full h-full"
          allowFullScreen
          {...props}
        />
      </span>
    </Lightbox>
  ),
  video: ({ ...props }: El<"video">) => (
    <Lightbox>
      <span className="block mb-4 rounded-lg overflow-hidden">
        <video
          className="w-full"
          controls
          {...props}
        />
      </span>
    </Lightbox>
  ),
  Video: ({ src, title }: { src: string; title?: string }) => {
    const isYouTube = src.includes("youtube.com") || src.includes("youtu.be");
    const isVimeo = src.includes("vimeo.com");

    if (isYouTube || isVimeo) {
      let embedUrl = src;
      if (isYouTube) {
        const match = src.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
        if (match) embedUrl = `https://www.youtube.com/embed/${match[1]}`;
      } else if (isVimeo) {
        const match = src.match(/vimeo\.com\/(\d+)/);
        if (match) embedUrl = `https://player.vimeo.com/video/${match[1]}`;
      }
      return (
        <span className="block mb-4">
          <Lightbox>
            <span className="block rounded-lg overflow-hidden aspect-video">
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allowFullScreen
                title={title ?? "Video"}
              />
            </span>
          </Lightbox>
          {title && (
            <span className="block text-center text-xs text-muted-foreground mt-2">
              {title}
            </span>
          )}
        </span>
      );
    }

    return (
      <span className="block mb-4">
        <Lightbox>
          <span className="block rounded-lg overflow-hidden">
            <video src={src} controls className="w-full" title={title} />
          </span>
        </Lightbox>
        {title && (
          <span className="block text-center text-xs text-muted-foreground mt-2">
            {title}
          </span>
        )}
      </span>
    );
  },
};

export async function renderMDX(source: string) {
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkGithubBlockquoteAlert],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypePrettyCode,
            {
              defaultColor: false,
              theme: {
                light: "github-light",
                dark: "github-dark",
              },
            },
          ],
        ],
      },
    },
  });
  return content;
}

export function extractHeadings(
  source: string
): { id: string; text: string; level: 2 | 3 }[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: { id: string; text: string; level: 2 | 3 }[] = [];
  let match;
  while ((match = headingRegex.exec(source)) !== null) {
    const level = match[1].length as 2 | 3;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    headings.push({ id, text, level });
  }
  return headings;
}
