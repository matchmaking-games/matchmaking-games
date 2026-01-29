import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function JobsSidebar() {
  return (
    <Card className="p-4 space-y-6 lg:sticky lg:top-24">
      <h2 className="font-semibold text-lg">Filtros</h2>

      {/* Nivel */}
      <div className="space-y-2">
        <Label className="text-sm">Nível</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Todos os níveis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="iniciante">Iniciante</SelectItem>
            <SelectItem value="junior">Júnior</SelectItem>
            <SelectItem value="pleno">Pleno</SelectItem>
            <SelectItem value="senior">Sênior</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tipo de Contrato */}
      <div className="space-y-2">
        <Label className="text-sm">Tipo de Contrato</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="clt">CLT</SelectItem>
            <SelectItem value="pj">PJ</SelectItem>
            <SelectItem value="freelance">Freelance</SelectItem>
            <SelectItem value="estagio">Estágio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Modelo de Trabalho */}
      <div className="space-y-2">
        <Label className="text-sm">Modelo de Trabalho</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Todos os modelos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="presencial">Presencial</SelectItem>
            <SelectItem value="hibrido">Híbrido</SelectItem>
            <SelectItem value="remoto">Remoto</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Localizacao */}
      <div className="space-y-2">
        <Label className="text-sm">Localização</Label>
        <Input placeholder="Ex: São Paulo" disabled />
      </div>

      {/* Habilidades por categoria */}
      <div className="space-y-4">
        <Label className="text-sm">Habilidades</Label>
        <div className="space-y-3">
          {/* Engines */}
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Engines</span>
            <Select disabled>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Selecionar..." />
              </SelectTrigger>
            </Select>
          </div>
          {/* Linguagens */}
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Linguagens</span>
            <Select disabled>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Selecionar..." />
              </SelectTrigger>
            </Select>
          </div>
          {/* Ferramentas */}
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Ferramentas</span>
            <Select disabled>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Selecionar..." />
              </SelectTrigger>
            </Select>
          </div>
          {/* Soft Skills */}
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Soft Skills</span>
            <Select disabled>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Selecionar..." />
              </SelectTrigger>
            </Select>
          </div>
        </div>
      </div>

      {/* Nota visual */}
      <p className="text-xs text-muted-foreground italic pt-2 border-t border-border">
        Filtros em breve disponíveis
      </p>
    </Card>
  );
}
