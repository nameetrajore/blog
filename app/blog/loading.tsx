export default function BlogListLoading() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 min-h-screen">
      <div className="h-9 w-24 bg-muted rounded mb-8 animate-pulse" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    </main>
  );
}
