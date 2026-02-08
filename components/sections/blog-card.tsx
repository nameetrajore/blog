import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function BlogCard({
  slug,
  title,
  description,
  date,
  readingTime,
}: {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingTime: string;
}) {
  return (
    <Link href={`/blog/${slug}`}>
      <Card className="hover-lift hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            {date && <time>{date}</time>}
            {date && readingTime && <span>·</span>}
            {readingTime && <span>{readingTime}</span>}
          </div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      </Card>
    </Link>
  );
}
