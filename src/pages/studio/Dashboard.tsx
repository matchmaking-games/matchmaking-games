import { StudioDashboardLayout } from "@/components/studio/StudioDashboardLayout";
import { useStudioMembership } from "@/hooks/useStudioMembership";

export default function StudioDashboard() {
  const { data: membership } = useStudioMembership();

  return (
    <StudioDashboardLayout>
      <div className="max-w-4xl">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          Dashboard
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          Bem-vindo ao painel do {membership?.estudio.nome}
        </p>
        <p className="text-muted-foreground">
          Gerencie suas vagas, equipe e perfil do estúdio através do menu lateral.
        </p>
      </div>
    </StudioDashboardLayout>
  );
}
