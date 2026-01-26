import { cn } from "@/lib/utils";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import type { PublicSkillData } from "@/hooks/usePublicProfile";

interface SkillsSectionProps {
  skills: PublicSkillData[];
}

const levelDots: Record<string, number> = {
  basico: 1,
  intermediario: 2,
  avancado: 3,
  expert: 4,
};

const categoryLabels: Record<string, string> = {
  engine: "Engines",
  linguagem: "Linguagens",
  ferramenta: "Ferramentas",
  soft_skill: "Soft Skills",
};

const categoryOrder = ["engine", "linguagem", "ferramenta", "soft_skill"];

function SkillDots({ level }: { level: string }) {
  const filled = levelDots[level] || 1;
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4].map((dot) => (
        <div
          key={dot}
          className={cn(
            "w-2 h-2 rounded-full",
            dot <= filled ? "bg-primary" : "bg-muted"
          )}
        />
      ))}
    </div>
  );
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  // Group skills by category
  const groupedSkills = skills.reduce<Record<string, PublicSkillData[]>>(
    (acc, skill) => {
      const category = skill.habilidade?.categoria;
      if (!category) return acc;
      
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(skill);
      return acc;
    },
    {}
  );

  // Sort categories by predefined order
  const sortedCategories = categoryOrder.filter((cat) => groupedSkills[cat]);

  return (
    <section id="skills" className="scroll-mt-20">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-display font-semibold text-foreground">
            Habilidades
          </h2>
        </CardHeader>
        <CardContent>
          {skills.length === 0 ? (
            <p className="text-muted-foreground italic">
              Nenhuma habilidade adicionada ainda.
            </p>
          ) : (
            <div className="space-y-8">
              {sortedCategories.map((category) => (
                <div key={category} className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {categoryLabels[category] || category}
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {groupedSkills[category].map((skill) => (
                      <div
                        key={skill.id}
                        className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-foreground text-sm truncate">
                            {skill.habilidade?.nome}
                          </span>
                          <SkillDots level={skill.nivel} />
                        </div>
                        
                        {skill.anos_experiencia && skill.anos_experiencia > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {skill.anos_experiencia} {skill.anos_experiencia === 1 ? "ano" : "anos"}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
