import { Link } from "react-router-dom";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveStudio } from "@/hooks/useActiveStudio";
import { useStudioProfileCompletion } from "@/hooks/useStudioProfileCompletion";

export function StudioProfileCompletion() {
  const { activeStudio, isLoading } = useActiveStudio();

  const estudioData = activeStudio
    ? { ...activeStudio.estudio } as Parameters<typeof useStudioProfileCompletion>[0]
    : null;

  const { percentage, incompleteItems } = useStudioProfileCompletion(estudioData);

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-4 w-48" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{percentage}% completo</span>
            </div>
            <Progress value={percentage} className="h-2" />

            {percentage === 100 ? (
              <div className="flex items-center gap-2 text-sm text-primary">
                <CheckCircle className="h-4 w-4" />
                <span>
                  Parabéns! O perfil do estúdio está completo.{" "}
                  <a
                    href={`/studio/${activeStudio?.estudio.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:opacity-80"
                  >
                    Ver página pública
                  </a>
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                {incompleteItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
