import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StudioCTACardProps {
  onDismiss: () => Promise<void>;
}

export function StudioCTACard({ onDismiss }: StudioCTACardProps) {
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
          <Building2 className="h-8 w-8 text-muted-foreground shrink-0" />

          <div className="flex-1 space-y-1">
            <p className="font-medium text-foreground">Você tem um estúdio de games?</p>
            <p className="text-sm text-muted-foreground">
              Crie a página do seu estúdio no Matchmaking e publique vagas para encontrar os melhores talentos da
              indústria.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:shrink-0">
            <Button size="sm" onClick={() => navigate("/studio/manage/new")}>
              Criar estúdio
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
