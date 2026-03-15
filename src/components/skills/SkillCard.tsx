import { Gamepad2, Code, Wrench, Brain, Award, EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserSkill } from "@/hooks/dashboard/useSkills";

interface SkillCardProps {
  skill: UserSkill;
  onEdit: (skill: UserSkill) => void;
  onDelete: (skill: UserSkill) => void;
}

const categoryIcons: Record<string, typeof Gamepad2> = {
  habilidades: Brain,
  softwares: Wrench,
  engine: Gamepad2,
  linguagem: Code,
  ferramenta: Wrench,
  soft_skill: Brain,
};

const categoryLabels: Record<string, string> = {
  habilidades: "Habilidade",
  softwares: "Software",
  engine: "Engine",
  linguagem: "Linguagem",
  ferramenta: "Ferramenta",
  soft_skill: "Soft Skill",
};

const levelConfig = {
  basico: {
    label: "Básico",
    className: "bg-gray-500/20 text-gray-300 border border-gray-500/30 hover:bg-gray-500/20",
  },
  intermediario: {
    label: "Intermediário",
    className: "bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/20",
  },
  avancado: {
    label: "Avançado",
    className: "bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/20",
  },
  expert: {
    label: "Expert",
    className: "bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20",
  },
};

export function SkillCard({ skill, onEdit, onDelete }: SkillCardProps) {
  const CategoryIcon = categoryIcons[skill.habilidade.categoria];
  const level = levelConfig[skill.nivel];

  const ActionsDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(skill)}>
          <Pencil className="h-4 w-4 mr-2" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onDelete(skill)} className="text-destructive focus:text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <Card className="transition-all hover:border-primary/30">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-muted">
              <CategoryIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-medium text-foreground">{skill.habilidade.nome}</h3>
              <p className="text-xs text-muted-foreground">{categoryLabels[skill.habilidade.categoria]}</p>
              <Badge className={level.className}>
                <Award className="h-3 w-3 mr-1" />
                {level.label}
              </Badge>
            </div>
          </div>
          <ActionsDropdown />
        </div>
      </CardContent>
    </Card>
  );
}
