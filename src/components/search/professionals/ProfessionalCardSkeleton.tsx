import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfessionalCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex gap-4 items-start">
        <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-5 w-20 flex-shrink-0" />
          </div>
        </div>
      </div>
      <div className="flex gap-1.5 mt-3 pt-3 border-t border-border/50">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-14" />
      </div>
    </Card>
  );
}

export function ProfessionalCardSkeletonGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <ProfessionalCardSkeleton key={i} />
      ))}
    </div>
  );
}
