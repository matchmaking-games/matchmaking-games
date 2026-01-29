import { Briefcase } from "lucide-react";
import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { JobCard } from "@/components/jobs/JobCard";
import { JobsSidebar } from "@/components/jobs/JobsSidebar";
import { JobsSkeletonGrid } from "@/components/jobs/JobCardSkeleton";
import { useJobs } from "@/hooks/useJobs";
import { useToast } from "@/hooks/use-toast";

export default function Jobs() {
  const { data: jobs, isLoading, error } = useJobs();
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar vagas",
        description: "Não foi possível carregar as vagas. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-16">
        {/* Hero Section */}
        <div className="bg-card border-b border-border py-8">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-display font-bold text-foreground">
              Vagas
            </h1>
            <p className="text-muted-foreground mt-2">
              Encontre sua próxima oportunidade na indústria de games
            </p>
          </div>
        </div>

        {/* Content with Sidebar */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Filters (expanded by default on mobile) */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <JobsSidebar />
            </aside>

            {/* Grid of Jobs */}
            <main className="flex-1">
              {isLoading ? (
                <JobsSkeletonGrid />
              ) : !jobs || jobs.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid gap-4">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Briefcase className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        Nenhuma vaga disponível no momento
      </h3>
      <p className="text-muted-foreground max-w-md">
        Volte em breve! Novas oportunidades são publicadas regularmente.
      </p>
    </div>
  );
}
