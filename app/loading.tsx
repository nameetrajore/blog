export default function HomeLoading() {
  return (
    <main className="mx-auto max-w-2xl px-6 min-h-screen">
      {/* Intro skeleton */}
      <div className="pt-14 pb-8 md:pt-[5.25rem] md:pb-8 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded mb-3" />
        <div className="h-4 w-64 bg-muted rounded mb-6" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-5/6 bg-muted rounded" />
          <div className="h-4 w-4/6 bg-muted rounded" />
        </div>
      </div>

      {/* Section skeleton */}
      {[1, 2].map((i) => (
        <div key={i} className="mb-16 animate-pulse">
          <div className="h-6 w-32 bg-muted rounded mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-20 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}
