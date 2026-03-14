import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProjectSearchCardSkeleton() {
  return (
    <Card className="overflow-hidden bg-card/50 border-border/50">
      {/* Cover image */}
      <Skeleton className="w-full h-[180px]" />

      {/* Info */}
      <div className="p-4 space-y-2">
        {/* Title + engine */}
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-5 w-[70px] flex-shrink-0" />
        </div>

        {/* Platforms */}
        <div className="flex gap-1">
          <Skeleton className="h-5 w-[60px]" />
          <Skeleton className="h-5 w-[50px]" />
          <Skeleton className="h-5 w-[40px]" />
        </div>

        {/* Genres */}
        <div className="flex gap-1">
          <Skeleton className="h-5 w-[55px]" />
          <Skeleton className="h-5 w-[45px]" />
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 pt-3 border-t border-border/50">
          <Skeleton className="w-6 h-6 rounded-full flex-shrink-0" />
          <Skeleton className="h-3 w-[100px]" />
          <Skeleton className="h-5 w-[50px] ml-auto flex-shrink-0" />
        </div>
      </div>
    </Card>
  );
}

export function ProjectSearchCardSkeletonGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <ProjectSearchCardSkeleton key={i} />
      ))}
    </div>
  );
}
