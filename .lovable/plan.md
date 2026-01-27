

## Plano Corrigido: Funcionalidade de Progressao de Carreira (Adicionar Cargo)

### Visao Geral

Implementar a funcionalidade de adicionar multiplos cargos a uma mesma empresa, permitindo representar progressao de carreira. O plano incorpora TODAS as correcoes criticas mencionadas.

---

### Correcoes Criticas Incorporadas

| Correcao | Status |
|----------|--------|
| NAO limpar campos de `experiencia` (manter dados duplicados) | Incorporado |
| Implementar `validateDatesOverlap` completo | Incorporado |
| Atualizar `usePublicProfile.ts` com cargos | Incorporado |
| Atualizar `ExperienceSection.tsx` (perfil publico) | Incorporado |
| Ordenacao client-side apos fetch | Incorporado |

---

### Pre-requisitos

| Item | Status | Acao |
|------|--------|------|
| Tabela `cargos_experiencia` no banco | Existe | Nenhuma |
| Tipos TypeScript para `cargos_experiencia` | NAO EXISTE | Migracao vazia para regenerar |
| RLS policies para `cargos_experiencia` | Existe | Nenhuma |

---

### Estrutura de Arquivos

| Acao | Arquivo | Descricao |
|------|---------|-----------|
| Criar | Migracao SQL | Migracao vazia para regenerar tipos |
| Modificar | `src/hooks/useExperiences.ts` | Query com cargos + addCargo + validacao |
| Modificar | `src/hooks/usePublicProfile.ts` | Query com cargos |
| Modificar | `src/components/experience/ExperienceModal.tsx` | Modo add-position |
| Modificar | `src/components/experience/ExperienceCard.tsx` | DropdownMenu + timeline interna |
| Modificar | `src/components/experience/ExperienceList.tsx` | Prop onAddCargo + remover timeline global |
| Modificar | `src/pages/Experience.tsx` | Estado do modo + handler addCargo |
| Modificar | `src/components/public-profile/ExperienceSection.tsx` | Timeline condicional |

---

### Secao Tecnica

#### 1. Migracao SQL (Regenerar Tipos)

```sql
-- Migracao vazia para forcar regeneracao dos tipos TypeScript
-- A tabela cargos_experiencia ja existe no banco
SELECT 1;
```

---

#### 2. useExperiences.ts - Alteracoes Completas

**2.1 Novos Tipos**

```typescript
// Tipo para cargo individual (de cargos_experiencia)
export interface CargoExperiencia {
  id: string;
  experiencia_id: string;
  titulo_cargo: string;
  tipo_emprego: Database["public"]["Enums"]["tipo_emprego"];
  inicio: string;
  fim: string | null;
  atualmente_trabalhando: boolean | null;
  descricao: string | null;
  habilidades_usadas: string[] | null;
  ordem: number | null;
}

// Experience expandida com cargos
export interface ExperienceWithCargos extends Experience {
  cargos: CargoExperiencia[];
}

// Insert para cargo
export interface CargoInsert {
  titulo_cargo: string;
  tipo_emprego: Database["public"]["Enums"]["tipo_emprego"];
  inicio: string;
  fim: string | null;
  atualmente_trabalhando: boolean | null;
  descricao: string | null;
  habilidades_usadas: string[] | null;
}
```

**2.2 Query Expandida com JOIN**

```typescript
const fetchExperiences = useCallback(async () => {
  if (!userId) return;

  const { data, error } = await supabase
    .from("experiencia")
    .select(`
      *,
      cargos:cargos_experiencia(
        id,
        experiencia_id,
        titulo_cargo,
        tipo_emprego,
        inicio,
        fim,
        atualmente_trabalhando,
        descricao,
        habilidades_usadas,
        ordem
      )
    `)
    .eq("user_id", userId)
    .order("ordem");

  if (error) throw error;

  // Ordenacao client-side: cargos por data (mais recente primeiro)
  const experiencesWithSortedCargos = (data || []).map(exp => ({
    ...exp,
    cargos: (exp.cargos || []).sort((a, b) => 
      new Date(b.inicio).getTime() - new Date(a.inicio).getTime()
    )
  }));

  setExperiences(experiencesWithSortedCargos);
}, [userId]);
```

**2.3 Funcoes de Validacao de Overlap (COMPLETAS)**

```typescript
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Auxiliar: verificar se dois periodos se sobrepoem
function checkPeriodsOverlap(
  start1: Date,
  end1: Date | null,
  start2: Date,
  end2: Date | null
): boolean {
  // Tratar "atualmente trabalhando" como fim em 2099
  const effectiveEnd1 = end1 || new Date(2099, 11, 31);
  const effectiveEnd2 = end2 || new Date(2099, 11, 31);
  
  // Periodos sobrepoem se: inicio1 <= fim2 E inicio2 <= fim1
  return start1 <= effectiveEnd2 && start2 <= effectiveEnd1;
}

// Auxiliar: formatar mes/ano para mensagens
function formatMonth(date: Date): string {
  return format(date, "MMM yyyy", { locale: ptBR });
}

// Funcao principal de validacao
function validateDatesOverlap(
  newCargo: { inicio: string; fim: string | null; atualmente: boolean | null },
  existingCargos: Array<{ inicio: string; fim: string | null; atualmente: boolean | null }>
): string | null {
  const newStart = new Date(newCargo.inicio);
  const newEnd = newCargo.atualmente ? null : (newCargo.fim ? new Date(newCargo.fim) : null);

  for (const existing of existingCargos) {
    const existingStart = new Date(existing.inicio);
    const existingEnd = existing.atualmente ? null : (existing.fim ? new Date(existing.fim) : null);

    // Caso especial: dois cargos "atualmente trabalhando"
    if (newCargo.atualmente && existing.atualmente) {
      return "Voce ja possui um cargo ativo (Atualmente trabalhando) nesta empresa. " +
             "Defina uma data de termino para o cargo atual antes de adicionar um novo cargo ativo.";
    }

    // Verificar sobreposicao de periodos
    const hasOverlap = checkPeriodsOverlap(newStart, newEnd, existingStart, existingEnd);
    
    if (hasOverlap) {
      const existingPeriod = existing.atualmente 
        ? `desde ${formatMonth(existingStart)}`
        : `de ${formatMonth(existingStart)} ate ${formatMonth(existingEnd!)}`;
      
      return `Este cargo conflita com um periodo existente (${existingPeriod}). ` +
             `As datas nao podem se sobrepor. O novo cargo comeca em ${formatMonth(newStart)}.`;
    }
  }

  return null; // Sem conflito
}
```

**2.4 Funcao addCargo (CORRIGIDA - SEM PASSO C)**

```typescript
const addCargo = useCallback(async (
  experienceId: string,
  cargoData: CargoInsert
): Promise<void> => {
  if (!userId) throw new Error("Usuario nao autenticado");

  // 1. Buscar experiencia atual com cargos existentes
  const { data: experience, error: fetchError } = await supabase
    .from("experiencia")
    .select(`
      *,
      cargos:cargos_experiencia(
        id, titulo_cargo, tipo_emprego, inicio, fim, atualmente_trabalhando
      )
    `)
    .eq("id", experienceId)
    .single();

  if (fetchError || !experience) {
    throw new Error("Experiencia nao encontrada");
  }

  const existingCargos = experience.cargos || [];
  const isFirstAdditionalCargo = existingCargos.length === 0;

  // 2. Preparar lista de cargos para validacao
  const cargosParaValidar = isFirstAdditionalCargo
    ? [{ 
        inicio: experience.inicio, 
        fim: experience.fim, 
        atualmente: experience.atualmente_trabalhando 
      }]
    : existingCargos.map(c => ({ 
        inicio: c.inicio, 
        fim: c.fim, 
        atualmente: c.atualmente_trabalhando 
      }));

  // 3. Validar overlap de datas
  const overlapError = validateDatesOverlap(
    { 
      inicio: cargoData.inicio, 
      fim: cargoData.fim, 
      atualmente: cargoData.atualmente_trabalhando 
    },
    cargosParaValidar
  );

  if (overlapError) {
    throw new Error(overlapError);
  }

  // 4. Se for o PRIMEIRO cargo adicional, migrar cargo original
  if (isFirstAdditionalCargo) {
    // PASSO A: Criar registro do cargo ORIGINAL em cargos_experiencia
    const { error: errorOriginal } = await supabase
      .from("cargos_experiencia")
      .insert({
        experiencia_id: experienceId,
        titulo_cargo: experience.titulo_cargo,
        tipo_emprego: experience.tipo_emprego,
        inicio: experience.inicio,
        fim: experience.fim,
        atualmente_trabalhando: experience.atualmente_trabalhando,
        descricao: experience.descricao,
        habilidades_usadas: experience.habilidades_usadas,
        ordem: 0
      });

    if (errorOriginal) {
      console.error("Erro ao migrar cargo original:", errorOriginal);
      throw new Error("Nao foi possivel adicionar o cargo. Tente novamente.");
    }

    // PASSO B: Criar registro do cargo NOVO em cargos_experiencia
    const { error: errorNovo } = await supabase
      .from("cargos_experiencia")
      .insert({
        experiencia_id: experienceId,
        titulo_cargo: cargoData.titulo_cargo,
        tipo_emprego: cargoData.tipo_emprego,
        inicio: cargoData.inicio,
        fim: cargoData.fim,
        atualmente_trabalhando: cargoData.atualmente_trabalhando,
        descricao: cargoData.descricao,
        habilidades_usadas: cargoData.habilidades_usadas,
        ordem: 1
      });

    if (errorNovo) {
      console.error("Erro ao criar novo cargo:", errorNovo);
      throw new Error("Nao foi possivel adicionar o cargo. Tente novamente.");
    }

    // NOTA IMPORTANTE: NAO limpar os campos de cargo em experiencia.
    // Manter dados duplicados para garantir compatibilidade com codigo existente.
    // A renderizacao usa: se cargos.length > 0, mostra timeline; senao, mostra experience.titulo_cargo
  } else {
    // 5. Se for o SEGUNDO+ cargo, apenas criar em cargos_experiencia
    const { error } = await supabase
      .from("cargos_experiencia")
      .insert({
        experiencia_id: experienceId,
        titulo_cargo: cargoData.titulo_cargo,
        tipo_emprego: cargoData.tipo_emprego,
        inicio: cargoData.inicio,
        fim: cargoData.fim,
        atualmente_trabalhando: cargoData.atualmente_trabalhando,
        descricao: cargoData.descricao,
        habilidades_usadas: cargoData.habilidades_usadas,
        ordem: existingCargos.length // Proxima posicao na ordem
      });

    if (error) {
      console.error("Erro ao criar cargo:", error);
      throw new Error("Nao foi possivel adicionar o cargo. Tente novamente.");
    }
  }
}, [userId]);
```

**2.5 Retorno Atualizado do Hook**

```typescript
return {
  experiences,
  loading,
  error,
  refetch: fetchExperiences,
  addExperience,
  updateExperience,
  deleteExperience,
  addCargo, // NOVA FUNCAO
};
```

---

#### 3. usePublicProfile.ts - Query Expandida

**3.1 Tipo Atualizado**

```typescript
export interface PublicCargoData {
  id: string;
  titulo_cargo: string;
  tipo_emprego: TipoEmprego;
  inicio: string;
  fim: string | null;
  atualmente_trabalhando: boolean | null;
  descricao: string | null;
  ordem: number | null;
}

export interface PublicExperienceData {
  id: string;
  titulo_cargo: string;
  empresa: string;
  tipo_emprego: TipoEmprego;
  inicio: string;
  fim: string | null;
  atualmente_trabalhando: boolean | null;
  descricao: string | null;
  localizacao: string | null;
  cidade: string | null;
  estado: string | null;
  remoto: boolean | null;
  estudio_id: string | null;
  cargos: PublicCargoData[]; // NOVO CAMPO
}
```

**3.2 Query de Experiencias Expandida**

```typescript
// Na Promise.all, substituir a query de experiencias:
supabase
  .from("experiencia")
  .select(`
    id, titulo_cargo, empresa, tipo_emprego, inicio, fim,
    atualmente_trabalhando, descricao, localizacao, cidade, estado, remoto, estudio_id,
    cargos:cargos_experiencia(
      id, titulo_cargo, tipo_emprego, inicio, fim,
      atualmente_trabalhando, descricao, ordem
    )
  `)
  .eq("user_id", user.id)
  .order("ordem")
```

**3.3 Pos-processamento para Ordenar Cargos**

```typescript
// Apos o Promise.all, ordenar cargos client-side:
const experiencesWithSortedCargos = (experiencesRes.data || []).map(exp => ({
  ...exp,
  cargos: (exp.cargos || []).sort((a, b) => 
    new Date(b.inicio).getTime() - new Date(a.inicio).getTime()
  )
}));

return {
  user: user as PublicUserData,
  projects: (projectsRes.data || []) as PublicProjectData[],
  skills: (skillsRes.data || []) as PublicSkillData[],
  experiences: experiencesWithSortedCargos as PublicExperienceData[],
  educations: (educationsRes.data || []) as PublicEducationData[],
};
```

---

#### 4. ExperienceModal.tsx - Modo Add-Position

**4.1 Props Atualizadas**

```typescript
interface ExperienceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingExperience: Experience | null;
  onSuccess: () => void;
  // NOVAS PROPS
  mode?: "create" | "edit" | "add-position";
  parentExperience?: ExperienceWithCargos | null;
}
```

**4.2 Titulo Dinamico**

```typescript
const getModalTitle = () => {
  if (mode === "add-position" && parentExperience) {
    return `Adicionar Cargo - ${parentExperience.empresa}`;
  }
  if (editingExperience) {
    return "Editar Experiencia";
  }
  return "Adicionar Experiencia";
};
```

**4.3 Pre-preenchimento no useEffect**

```typescript
useEffect(() => {
  if (open) {
    if (mode === "add-position" && parentExperience) {
      // Modo adicionar cargo: pre-preencher empresa e localizacao
      form.reset({
        titulo_cargo: "",  // VAZIO - usuario preenche
        empresa: parentExperience.empresa,  // PRE-PREENCHIDO
        tipo_emprego: "clt",  // Default - usuario escolhe
        estado: parentExperience.estado || "",  // PRE-PREENCHIDO mas EDITAVEL
        cidade: parentExperience.cidade || "",  // PRE-PREENCHIDO mas EDITAVEL
        cidade_ibge_id: parentExperience.cidade_ibge_id || 0,
        remoto: parentExperience.remoto || false,  // PRE-PREENCHIDO mas EDITAVEL
        inicio: "",  // VAZIO - usuario preenche
        atualmente_trabalhando: false,
        fim: "",
        descricao: "",
      });
      
      // Carregar municipios se estado preenchido e nao remoto
      if (parentExperience.estado && !parentExperience.remoto) {
        fetchMunicipios(parentExperience.estado);
      }
    } else if (editingExperience) {
      // Modo edicao - codigo existente
      // ...
    } else {
      // Modo criacao - codigo existente
      // ...
    }
  }
}, [open, mode, parentExperience, editingExperience, ...]);
```

**4.4 Campo Empresa Desabilitado**

```tsx
<FormField
  control={form.control}
  name="empresa"
  render={({ field }) => (
    <FormItem>
      <FormLabel>
        Estudio <span className="text-destructive">*</span>
      </FormLabel>
      <FormControl>
        <Input 
          placeholder="Ex: Ubisoft" 
          {...field} 
          disabled={mode === "add-position"}
          className={mode === "add-position" ? "bg-muted cursor-not-allowed" : ""}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

**4.5 Submit Handler com Modo Add-Position**

```typescript
const onSubmit = async (data: ExperienceFormData) => {
  try {
    setIsSubmitting(true);

    const localizacao = data.remoto ? "Remoto" : `${data.cidade}, ${data.estado}`;
    const inicioDate = `${data.inicio}-01`;
    const fimDate = data.fim ? `${data.fim}-01` : null;

    if (mode === "add-position" && parentExperience) {
      // Modo adicionar cargo
      await addCargo(parentExperience.id, {
        titulo_cargo: data.titulo_cargo,
        tipo_emprego: data.tipo_emprego,
        inicio: inicioDate,
        fim: fimDate,
        atualmente_trabalhando: data.atualmente_trabalhando,
        descricao: data.descricao || null,
        habilidades_usadas: null,
      });
      
      toast({
        title: "Cargo adicionado",
        description: `Novo cargo "${data.titulo_cargo}" adicionado com sucesso.`,
      });
    } else if (isEditing) {
      // Modo edicao - codigo existente
      await updateExperience(editingExperience.id, experienceData);
      toast({ title: "Experiencia atualizada", ... });
    } else {
      // Modo criacao - codigo existente
      await addExperience(experienceData);
      toast({ title: "Experiencia adicionada", ... });
    }

    onSuccess();
    onOpenChange(false);
  } catch (error) {
    // Mostrar erro amigavel (mensagens claras da validacao)
    toast({
      title: "Erro ao salvar",
      description: error instanceof Error ? error.message : "Nao foi possivel salvar.",
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
  }
};
```

---

#### 5. ExperienceCard.tsx - DropdownMenu + Timeline Interna

**5.1 Props Atualizadas**

```typescript
interface ExperienceCardProps {
  experience: ExperienceWithCargos;
  onEdit: (experience: ExperienceWithCargos) => void;
  onDelete: (experience: ExperienceWithCargos) => void;
  onAddCargo: (experience: ExperienceWithCargos) => void; // NOVO
}
```

**5.2 Imports Adicionais**

```typescript
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical, Pencil, Plus, Trash2 } from "lucide-react";
```

**5.3 Renderizacao Condicional**

```tsx
export function ExperienceCard({ experience, onEdit, onDelete, onAddCargo }: ExperienceCardProps) {
  const hasCargos = experience.cargos && experience.cargos.length > 0;

  // DropdownMenu comum a ambos os layouts
  const ActionsDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(experience)}>
          <Pencil className="h-4 w-4 mr-2" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAddCargo(experience)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar cargo
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => onDelete(experience)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Layout COM multiplos cargos (timeline interna)
  if (hasCargos) {
    return (
      <Card className="group transition-all hover:border-primary/30">
        <CardContent className="pt-6">
          {/* Header: Empresa */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{experience.empresa}</h3>
                {experience.localizacao && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {experience.localizacao}
                    {experience.remoto && " • Remoto"}
                  </p>
                )}
              </div>
            </div>
            <ActionsDropdown />
          </div>
          
          {/* Timeline interna de cargos */}
          <div className="relative ml-5 pl-6 border-l-2 border-border">
            {experience.cargos.map((cargo) => (
              <div key={cargo.id} className="relative pb-6 last:pb-0">
                {/* Dot da timeline */}
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary border-2 border-background" />
                
                {/* Info do cargo */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium">{cargo.titulo_cargo}</h4>
                    <Badge variant="outline" className={tipoEmpregoStyles[cargo.tipo_emprego]}>
                      {formatTipoEmprego(cargo.tipo_emprego)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDateRange(cargo.inicio, cargo.fim, cargo.atualmente_trabalhando)}
                  </p>
                  {cargo.descricao && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {cargo.descricao}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Layout SEM cargos extras (cargo unico - layout atual)
  return (
    <Card className="group transition-all hover:border-primary/30">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0 mt-1">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <h3 className="font-semibold text-lg text-foreground truncate">
                {experience.titulo_cargo}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-muted-foreground">{experience.empresa}</span>
                <Badge variant="outline" className={tipoEmpregoStyles[experience.tipo_emprego]}>
                  {formatTipoEmprego(experience.tipo_emprego)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDateRange(experience.inicio, experience.fim, experience.atualmente_trabalhando)}</span>
              </div>
              {/* ... resto do layout existente ... */}
            </div>
          </div>
          <ActionsDropdown />
        </div>
      </CardContent>
    </Card>
  );
}
```

---

#### 6. ExperienceList.tsx - Remover Timeline Global

**6.1 Props Atualizadas**

```typescript
interface ExperienceListProps {
  experiences: ExperienceWithCargos[];
  loading: boolean;
  onEdit: (experience: ExperienceWithCargos) => void;
  onDelete: (experience: ExperienceWithCargos) => void;
  onAddCargo: (experience: ExperienceWithCargos) => void; // NOVO
}
```

**6.2 Remover Timeline Global**

```tsx
// List SEM timeline global (timeline agora e interna ao card quando ha multiplos cargos)
return (
  <div className="space-y-4">
    {experiences.map((experience) => (
      <ExperienceCard
        key={experience.id}
        experience={experience}
        onEdit={onEdit}
        onDelete={onDelete}
        onAddCargo={onAddCargo}
      />
    ))}
  </div>
);
```

---

#### 7. Experience.tsx - Estado do Modo

**7.1 Novos Estados**

```typescript
const [modalMode, setModalMode] = useState<"create" | "edit" | "add-position">("create");
const [parentExperience, setParentExperience] = useState<ExperienceWithCargos | null>(null);
```

**7.2 Handlers Atualizados**

```typescript
const handleAdd = () => {
  setModalMode("create");
  setEditingExperience(null);
  setParentExperience(null);
  setIsModalOpen(true);
};

const handleEdit = (experience: ExperienceWithCargos) => {
  setModalMode("edit");
  setEditingExperience(experience);
  setParentExperience(null);
  setIsModalOpen(true);
};

const handleAddCargo = (experience: ExperienceWithCargos) => {
  setModalMode("add-position");
  setEditingExperience(null);
  setParentExperience(experience);
  setIsModalOpen(true);
};
```

**7.3 Props do Modal**

```tsx
<ExperienceModal
  open={isModalOpen}
  onOpenChange={setIsModalOpen}
  editingExperience={editingExperience}
  onSuccess={handleSuccess}
  mode={modalMode}
  parentExperience={parentExperience}
/>
```

**7.4 Props da Lista**

```tsx
<ExperienceList
  experiences={experiences}
  loading={loading}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onAddCargo={handleAddCargo}
/>
```

---

#### 8. ExperienceSection.tsx (Perfil Publico) - Timeline Condicional

**8.1 Componente CargoItem (Novo)**

```tsx
function CargoItem({ cargo }: { cargo: PublicCargoData }) {
  const [expanded, setExpanded] = useState(false);
  const hasLongDescription = cargo.descricao && cargo.descricao.length > 300;

  return (
    <div className="relative pb-6 last:pb-0">
      {/* Timeline dot */}
      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary border-2 border-background" />
      
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-medium text-foreground">{cargo.titulo_cargo}</h4>
          <Badge className={`border-0 ${typeColors[cargo.tipo_emprego]}`}>
            {typeLabels[cargo.tipo_emprego]}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground">
          {formatPeriod(cargo.inicio, cargo.fim, cargo.atualmente_trabalhando)}
          {" "}
          <span className="text-muted-foreground/70">
            {formatDuration(cargo.inicio, cargo.fim)}
          </span>
        </p>

        {cargo.descricao && (
          <div className="pt-1">
            <p className={`text-sm text-muted-foreground whitespace-pre-wrap ${
              !expanded && hasLongDescription ? "line-clamp-3" : ""
            }`}>
              {cargo.descricao}
            </p>
            {hasLongDescription && (
              <Button variant="link" size="sm" className="px-0 h-auto text-primary" onClick={() => setExpanded(!expanded)}>
                {expanded ? "Ler menos" : "Ler mais"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

**8.2 ExperienceItem Atualizado**

```tsx
function ExperienceItem({ experience }: { experience: PublicExperienceData }) {
  const hasCargos = experience.cargos && experience.cargos.length > 0;

  // Layout COM multiplos cargos (timeline interna)
  if (hasCargos) {
    // Ordenar cargos por data (mais recente primeiro) - ja vem ordenado do hook
    return (
      <div className="space-y-4">
        {/* Header da empresa */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{experience.empresa}</h3>
            {experience.localizacao && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {experience.localizacao}
                {experience.remoto && (
                  <Badge variant="outline" className="text-xs py-0 ml-2">
                    <Home className="w-3 h-3 mr-1" />
                    Remoto
                  </Badge>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Timeline interna de cargos */}
        <div className="relative ml-5 pl-6 border-l-2 border-border">
          {experience.cargos.map((cargo) => (
            <CargoItem key={cargo.id} cargo={cargo} />
          ))}
        </div>
      </div>
    );
  }

  // Layout SEM cargos extras (cargo unico - layout existente)
  return (
    <div className="space-y-2">
      {/* ... manter layout existente com experience.titulo_cargo ... */}
    </div>
  );
}
```

---

### Ordem de Implementacao

| Ordem | Arquivo | Complexidade |
|-------|---------|--------------|
| 1 | Migracao SQL | Baixa |
| 2 | `useExperiences.ts` | Alta |
| 3 | `usePublicProfile.ts` | Media |
| 4 | `ExperienceCard.tsx` | Media |
| 5 | `ExperienceList.tsx` | Baixa |
| 6 | `Experience.tsx` | Baixa |
| 7 | `ExperienceModal.tsx` | Alta |
| 8 | `ExperienceSection.tsx` | Media |

---

### Resumo da Logica de Renderizacao

| Situacao | O que renderiza |
|----------|-----------------|
| `experience.cargos.length === 0` | Layout simples com `experience.titulo_cargo` |
| `experience.cargos.length > 0` | Header com empresa + timeline interna com cargos |

---

### Mensagens de Erro Amigaveis

| Cenario | Mensagem |
|---------|----------|
| Dois cargos "atualmente trabalhando" | "Voce ja possui um cargo ativo (Atualmente trabalhando) nesta empresa. Defina uma data de termino para o cargo atual antes de adicionar um novo cargo ativo." |
| Datas sobrepostas | "Este cargo conflita com um periodo existente (de Jan 2022 ate Dez 2023). As datas nao podem se sobrepor. O novo cargo comeca em Jun 2023." |
| Erro generico | "Nao foi possivel adicionar o cargo. Tente novamente." |

---

### Checklist Final

| Item | Status |
|------|--------|
| NAO limpar campos de `experiencia` | Corrigido |
| Manter dados duplicados | Implementado |
| `validateDatesOverlap` completo | Implementado |
| `checkPeriodsOverlap` auxiliar | Implementado |
| `formatMonth` auxiliar | Implementado |
| `usePublicProfile.ts` com cargos | Implementado |
| `ExperienceSection.tsx` condicional | Implementado |
| Ordenacao client-side | Implementado |
| Mensagens de erro claras | Implementado |
| DropdownMenu para acoes | Implementado |
| Timeline global removida | Implementado |
| Timeline interna condicional | Implementado |

