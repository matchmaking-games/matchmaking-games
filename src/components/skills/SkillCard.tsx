import { Gamepad2, Code, Wrench, Brain, Award, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UserSkill } from "@/hooks/useSkills";

interface SkillCardProps {
  skill: UserSkill;
  onEdit: (skill: UserSkill) => void;
  onDelete: (skill: UserSkill) => void;
}

const categoryIcons = {
  engine: Gamepad2,
  linguagem: Code,
  ferramenta: Wrench,
  soft_skill: Brain,
};

const categoryLabels = {
  engine: "Engine",
  linguagem: "Linguagem",
  ferramenta: "Ferramenta",
  soft_skill: "Soft Skill",
};

const levelConfig = {
  basico: {
    label: "Básico",
    className: "bg-gray-500/20 text-gray-300 border border-gray-500/30",
  },
  intermediario: {
    label: "Intermediário",
    className: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  },
  avancado: {
    label: "Avançado",
    className: "bg-green-500/20 text-green-300 border border-green-500/30",
  },
  expert: {
    label: "Expert",
    className: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  },
};

export function SkillCard({ skill, onEdit, onDelete }: SkillCardProps) {
  const CategoryIcon = categoryIcons[skill.habilidade.categoria];
  const level = levelConfig[skill.nivel];

  return (
    <Card className="group hover:shadow-lg transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-muted">
              <CategoryIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-medium text-foreground">{skill.habilidade.nome}</h3>
              <p className="text-xs text-muted-foreground">
                {categoryLabels[skill.habilidade.categoria]}
              </p>
              <Badge className={level.className}>
                <Award className="h-3 w-3 mr-1" />
                {level.label}
              </Badge>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(skill)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(skill)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
