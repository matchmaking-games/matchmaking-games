import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StudioCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex gap-4 items-start">
        <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-5 w-20 flex-shrink-0" />
          </div>
        </div>
      </div>
      <div className="flex gap-1.5 mt-3 pt-3 border-t border-border/50">
        <Skeleton className="h-5 w-[70px]" />
        <Skeleton className="h-5 w-[60px]" />
        <Skeleton className="h-5 w-20" />
      </div>
    </Card>
  );
}

export function StudioCardSkeletonGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <StudioCardSkeleton key={i} />
      ))}
    </div>
  );
}
