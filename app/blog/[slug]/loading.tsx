export default function BlogPostLoading() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 min-h-screen">
      <article className="animate-pulse">
        <header className="mb-8">
          <div className="h-8 w-3/4 bg-muted rounded mb-3" />
          <div className="h-3 w-32 bg-muted rounded" />
        </header>
        <div className="space-y-4">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-5/6 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-4/6 bg-muted rounded" />
          <div className="h-32 w-full bg-muted rounded-lg" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-5/6 bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
        </div>
      </article>
    </main>
  );
}
