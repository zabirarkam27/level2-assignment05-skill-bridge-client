export function CourseCardSkeleton() {
  return (
    <div className="flex h-full min-h-[430px] animate-pulse flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="h-48 bg-gray-200 dark:bg-gray-700" />
      <div className="space-y-3 p-6">
        <div className="h-5 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-600" />
        <div className="h-4 w-5/6 rounded bg-gray-100 dark:bg-gray-600" />
        <div className="h-3 w-1/3 rounded bg-gray-100 dark:bg-gray-600" />
      </div>
    </div>
  );
}

export function CourseGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid auto-rows-fr items-stretch gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}
