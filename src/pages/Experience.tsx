import { Plus } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ProfileNavigation } from "@/components/dashboard/ProfileNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExperienceList } from "@/components/experience/ExperienceList";
import { useExperiences, type Experience } from "@/hooks/useExperiences";

export default function Experience() {
  const { experiences, loading, error } = useExperiences();

  const handleEdit = (experience: Experience) => {
    // TODO: Implement edit modal (future task)
    console.log("Edit:", experience.id);
  };

  const handleDelete = (experience: Experience) => {
    // TODO: Implement delete functionality (future task)
    console.log("Delete:", experience.id);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">
              Meu Perfil
            </h1>

            <ProfileNavigation />

            <div className="flex items-start justify-between gap-4 mb-6">
              <p className="text-muted-foreground">
                Adicione suas experiências profissionais na indústria de games
              </p>
              <Button disabled className="flex-shrink-0">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>

            {error && (
              <div className="text-destructive text-sm mb-4">
                {error}
              </div>
            )}

            <ExperienceList
              experiences={experiences}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
