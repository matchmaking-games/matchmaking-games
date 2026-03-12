import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StudioInviteCTACardProps {
  onDismiss: () => Promise<void>;
  estudioId: string;
}

export function StudioInviteCTACard({ onDismiss, estudioId }: StudioInviteCTACardProps) {
  const navigate = useNavigate();
  const [isDismissing, setIsDismissing] = useState(false);

  const handleDismiss = async () => {
    setIsDismissing(true);
    try {
      await onDismiss();
    } finally {
      setIsDismissing(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Users className="h-8 w-8 text-muted-foreground shrink-0" />

          <div className="flex-1 space-y-1">
            <p className="font-medium text-foreground">Seu estúdio está sozinho por aqui</p>
            <p className="text-sm text-muted-foreground">
              Convide outros membros da sua equipe para colaborar no estúdio. Eles poderão gerenciar vagas e o perfil do
              estúdio junto com você.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:shrink-0">
            <Button size="sm" onClick={() => navigate(`/studio/manage/team?studio=${estudioId}`)}>
              Convidar membros
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDismiss} disabled={isDismissing}>
              {isDismissing ? "Salvando..." : "Agora não"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
