

## Plano: Melhorias na Pagina de Experiencias Profissionais

### Visao Geral

Implementar 3 melhorias principais na pagina de gerenciamento de experiencias (`/dashboard/profile/experience`):
1. Condicionar timeline para aparecer apenas quando houver multiplos cargos na mesma empresa
2. Substituir icones de edicao/exclusao por menu dropdown com 3 opcoes
3. Adicionar funcionalidade de "Adicionar Cargo" para progressao de carreira

---

### Estrutura de Arquivos

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `src/hooks/useExperiences.ts` | Modificar | Adicionar funcao `addCargo` e retornar cargos na estrutura |
| `src/components/experience/ExperienceList.tsx` | Modificar | Remover timeline global, agrupar por empresa |
| `src/components/experience/ExperienceCard.tsx` | Modificar | Substituir icones por dropdown menu + prop para timeline |
| `src/components/experience/ExperienceModal.tsx` | Modificar | Adicionar modo "adicionar cargo" com campos pre-preenchidos |
| `src/pages/Experience.tsx` | Modificar | Adicionar handler `handleAddPosition` |

---

### Parte 1: Atualizar Hook useExperiences

**Arquivo:** `src/hooks/useExperiences.ts`

**Alteracoes:**

1. Modificar tipo `Experience` para incluir array de cargos:

```typescript
export interface Cargo {
  id: string;
  titulo_cargo: string;
  tipo_emprego: Database["public"]["Enums"]["tipo_emprego"];
  inicio: string;
  fim: string | null;
  atualmente_trabalhando: boolean | null;
  descricao: string | null;
  habilidades_usadas: string[] | null;
  ordem: number;
}

export interface Experience extends ExperienciaRow {
  // Cargo primario (mais recente) - para compatibilidade
  cargo_id: string | null;
  titulo_cargo: string;
  tipo_emprego: ...;
  // ... campos existentes ...
  
  // NOVO: Todos os cargos da experiencia
  cargos: Cargo[];
}
```

2. Modificar `fetchExperiences` para popular o array `cargos`

3. Adicionar nova funcao `addCargo`:

```typescript
export interface CargoInsertData {
  experiencia_id: string;
  titulo_cargo: string;
  tipo_emprego: Database["public"]["Enums"]["tipo_emprego"];
  inicio: string;
  fim?: string | null;
  atualmente_trabalhando?: boolean;
  descricao?: string | null;
}

const addCargo = useCallback(async (data: CargoInsertData): Promise<Cargo> => {
  // Validar datas (sem overlap)
  const existingExp = experiences.find(e => e.id === data.experiencia_id);
  if (!existingExp) throw new Error("Experiencia nao encontrada");
  
  // Verificar overlap de datas com cargos existentes
  for (const cargo of existingExp.cargos) {
    if (datesOverlap(cargo.inicio, cargo.fim, data.inicio, data.fim)) {
      throw new Error("Periodo conflita com outro cargo nesta empresa");
    }
  }
  
  // Calcular ordem baseado na data
  const ordem = existingExp.cargos.length;
  
  // Inserir cargo
  const { data: newCargo, error } = await supabase
    .from("cargos_experiencia")
    .insert({
      experiencia_id: data.experiencia_id,
      titulo_cargo: data.titulo_cargo,
      tipo_emprego: data.tipo_emprego,
      inicio: data.inicio,
      fim: data.fim,
      atualmente_trabalhando: data.atualmente_trabalhando,
      descricao: data.descricao,
      ordem,
    })
    .select()
    .single();
    
  return newCargo;
}, [experiences]);
```

4. Adicionar funcao helper para validar overlap de datas:

```typescript
function datesOverlap(
  start1: string, end1: string | null,
  start2: string, end2: string | null | undefined
): boolean {
  const s1 = new Date(start1);
  const e1 = end1 ? new Date(end1) : new Date();
  const s2 = new Date(start2);
  const e2 = end2 ? new Date(end2) : new Date();
  
  return s1 <= e2 && s2 <= e1;
}
```

5. Exportar `addCargo` no retorno do hook

---

### Parte 2: Atualizar ExperienceList (Remover Timeline Global)

**Arquivo:** `src/components/experience/ExperienceList.tsx`

**Alteracoes:**

1. REMOVER timeline vertical global (linhas 52-53):

```typescript
// REMOVER:
{/* Vertical timeline line - desktop only */}
<div className="hidden md:block absolute left-4 top-6 bottom-6 w-0.5 bg-border" />
```

2. REMOVER timeline dot individual (linhas 58-59):

```typescript
// REMOVER:
{/* Timeline dot - desktop only */}
<div className="hidden md:block absolute left-2.5 top-8 w-3 h-3 rounded-full bg-primary border-2 border-background z-10" />
```

3. REMOVER padding left do container (linha 57):

```typescript
// Antes:
<div key={experience.id} className="relative md:pl-10">

// Depois:
<div key={experience.id} className="relative">
```

4. Adicionar props `onAddPosition` ao componente e repassar para `ExperienceCard`:

```typescript
interface ExperienceListProps {
  experiences: Experience[];
  loading: boolean;
  onEdit: (experience: Experience) => void;
  onDelete: (experience: Experience) => void;
  onAddPosition: (experience: Experience) => void; // NOVO
}
```

5. Repassar para cada ExperienceCard:

```typescript
<ExperienceCard
  experience={experience}
  onEdit={onEdit}
  onDelete={onDelete}
  onAddPosition={onAddPosition}
  showTimeline={experience.cargos.length > 1} // Timeline so aparece com 2+ cargos
/>
```

---

### Parte 3: Atualizar ExperienceCard (Dropdown Menu)

**Arquivo:** `src/components/experience/ExperienceCard.tsx`

**Alteracoes:**

1. Adicionar imports:

```typescript
import { EllipsisVertical, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
```

2. Adicionar prop `onAddPosition`:

```typescript
interface ExperienceCardProps {
  experience: Experience;
  onEdit: (experience: Experience) => void;
  onDelete: (experience: Experience) => void;
  onAddPosition: (experience: Experience) => void; // NOVO
  showTimeline?: boolean; // NOVO
}
```

3. Substituir botoes de acao (linhas 111-130) por dropdown menu:

```typescript
{/* Action menu */}
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
    >
      <EllipsisVertical className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={() => onEdit(experience)}>
      <Pencil className="h-4 w-4 mr-2" />
      Editar
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => onAddPosition(experience)}>
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
```

4. Adicionar renderizacao de multiplos cargos quando `showTimeline = true`:

```typescript
// Dentro do card, apos o conteudo principal:
{showTimeline && experience.cargos.length > 1 && (
  <div className="mt-4 ml-6 border-l-2 border-primary/30 pl-4 space-y-4">
    {experience.cargos.slice(1).map((cargo) => (
      <div key={cargo.id} className="relative">
        {/* Dot na timeline */}
        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary" />
        
        {/* Info do cargo */}
        <div>
          <h4 className="font-medium">{cargo.titulo_cargo}</h4>
          <div className="text-sm text-muted-foreground">
            {formatDateRange(cargo.inicio, cargo.fim, cargo.atualmente_trabalhando)}
          </div>
          {cargo.descricao && (
            <p className="text-sm text-muted-foreground mt-1">{cargo.descricao}</p>
          )}
        </div>
      </div>
    ))}
  </div>
)}
```

---

### Parte 4: Atualizar ExperienceModal (Modo Adicionar Cargo)

**Arquivo:** `src/components/experience/ExperienceModal.tsx`

**Alteracoes:**

1. Adicionar prop `mode`:

```typescript
type ModalMode = "create" | "edit" | "add-position";

interface ExperienceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingExperience: Experience | null;
  onSuccess: () => void;
  mode?: ModalMode; // NOVO - default "create" ou "edit" baseado em editingExperience
}
```

2. Determinar modo no componente:

```typescript
const mode: ModalMode = props.mode || (editingExperience ? "edit" : "create");
const isAddingPosition = mode === "add-position";
```

3. Modificar titulo do modal:

```typescript
<DialogTitle className="font-display text-xl">
  {mode === "add-position" 
    ? `Adicionar Cargo - ${editingExperience?.empresa}`
    : mode === "edit"
    ? "Editar Experiência"
    : "Adicionar Experiência"
  }
</DialogTitle>
```

4. No `useEffect` de reset do form, adicionar logica para modo "add-position":

```typescript
useEffect(() => {
  if (open) {
    if (mode === "add-position" && editingExperience) {
      // Pre-preencher empresa e localizacao, deixar cargo vazio
      form.reset({
        titulo_cargo: "", // Vazio - usuario deve preencher
        empresa: editingExperience.empresa, // Pre-preenchido
        tipo_emprego: "clt", // Default
        estado: editingExperience.estado || "",
        cidade: editingExperience.cidade || "",
        cidade_ibge_id: editingExperience.cidade_ibge_id || 0,
        remoto: editingExperience.remoto || false,
        inicio: "", // Vazio - usuario deve preencher
        atualmente_trabalhando: false,
        fim: "",
        descricao: "",
      });
      
      if (editingExperience.estado && !editingExperience.remoto) {
        fetchMunicipios(editingExperience.estado);
      }
    } else if (editingExperience) {
      // ... logica existente de edicao ...
    } else {
      // ... logica existente de criacao ...
    }
  }
}, [open, editingExperience, mode, form, fetchMunicipios, clearMunicipios]);
```

5. Desabilitar campo "Empresa" quando estiver adicionando cargo:

```typescript
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
          disabled={isAddingPosition} // NOVO
          className={isAddingPosition ? "bg-muted" : ""} // NOVO
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

6. Modificar `onSubmit` para lidar com modo "add-position":

```typescript
const onSubmit = async (data: ExperienceFormData) => {
  try {
    setIsSubmitting(true);
    
    if (isAddingPosition && editingExperience) {
      // Adicionar cargo a experiencia existente
      await addCargo({
        experiencia_id: editingExperience.id,
        titulo_cargo: data.titulo_cargo,
        tipo_emprego: data.tipo_emprego,
        inicio: `${data.inicio}-01`,
        fim: data.fim ? `${data.fim}-01` : null,
        atualmente_trabalhando: data.atualmente_trabalhando,
        descricao: data.descricao || null,
      });
      
      toast({
        title: "Cargo adicionado",
        description: `Novo cargo adicionado em ${editingExperience.empresa}`,
      });
    } else if (isEditing) {
      // ... logica existente de update ...
    } else {
      // ... logica existente de create ...
    }
    
    onSuccess();
    onOpenChange(false);
  } catch (error) {
    // ... tratamento de erro ...
  }
};
```

7. Adicionar validacao de overlap de datas no submit:

```typescript
// Antes de adicionar cargo, validar overlap
if (isAddingPosition && editingExperience) {
  const inicioDate = new Date(`${data.inicio}-01`);
  const fimDate = data.fim ? new Date(`${data.fim}-01`) : new Date();
  
  for (const cargo of editingExperience.cargos || []) {
    const cargoInicio = new Date(cargo.inicio);
    const cargoFim = cargo.fim ? new Date(cargo.fim) : new Date();
    
    if (inicioDate <= cargoFim && cargoInicio <= fimDate) {
      toast({
        title: "Periodo invalido",
        description: "O periodo conflita com outro cargo nesta empresa",
        variant: "destructive",
      });
      return;
    }
  }
}
```

---

### Parte 5: Atualizar Experience.tsx (Handler para Adicionar Cargo)

**Arquivo:** `src/pages/Experience.tsx`

**Alteracoes:**

1. Adicionar estado para modo do modal:

```typescript
const [modalMode, setModalMode] = useState<"create" | "edit" | "add-position">("create");
```

2. Modificar handlers:

```typescript
const handleAdd = () => {
  setModalMode("create");
  setEditingExperience(null);
  setIsModalOpen(true);
};

const handleEdit = (experience: Experience) => {
  setModalMode("edit");
  setEditingExperience(experience);
  setIsModalOpen(true);
};

const handleAddPosition = (experience: Experience) => {
  setModalMode("add-position");
  setEditingExperience(experience);
  setIsModalOpen(true);
};
```

3. Passar `onAddPosition` para ExperienceList:

```typescript
<ExperienceList
  experiences={experiences}
  loading={loading}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onAddPosition={handleAddPosition} // NOVO
/>
```

4. Passar `mode` para ExperienceModal:

```typescript
<ExperienceModal
  open={isModalOpen}
  onOpenChange={setIsModalOpen}
  editingExperience={editingExperience}
  onSuccess={handleSuccess}
  mode={modalMode} // NOVO
/>
```

---

### Resultado Visual Esperado

**Antes (Timeline incorreta):**
```text
│
├── ● Game Developer
│     Ubisoft                    ← Timeline conectando
│                                   empresas diferentes
├── ● Game Designer
│     Indie Studio
│
```

**Depois (Sem timeline entre empresas):**
```text
┌─────────────────────────────────────┐
│ Game Developer                   ⋮  │  ← Dropdown menu
│ Ubisoft • CLT                       │
│ Jan 2022 - Atual                    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Game Designer                    ⋮  │
│ Indie Studio • PJ                   │
│ Mar 2020 - Dez 2021                 │
└─────────────────────────────────────┘
```

**Com multiplos cargos (timeline aparece):**
```text
┌─────────────────────────────────────┐
│ Senior Developer                 ⋮  │
│ Ubisoft • CLT                       │
│ Jan 2023 - Atual                    │
│ │                                   │
│ ├─ ● Mid Developer                  │  ← Timeline interna
│ │    Jan 2022 - Dez 2022            │
│ │                                   │
│ └─ ● Junior Developer               │
│      Jan 2020 - Dez 2021            │
└─────────────────────────────────────┘
```

**Dropdown menu:**
```text
┌─────────────────┐
│ ✏️ Editar       │
│ ➕ Adicionar cargo │
│ ─────────────── │
│ 🗑️ Excluir      │  ← Texto vermelho
└─────────────────┘
```

---

### Ordem de Implementacao

| Ordem | Arquivo | Complexidade |
|-------|---------|--------------|
| 1 | `src/hooks/useExperiences.ts` | Media (adicionar tipo Cargo, funcao addCargo) |
| 2 | `src/components/experience/ExperienceCard.tsx` | Media (dropdown menu + timeline interna) |
| 3 | `src/components/experience/ExperienceList.tsx` | Baixa (remover timeline global, passar props) |
| 4 | `src/components/experience/ExperienceModal.tsx` | Alta (modo add-position, campos desabilitados) |
| 5 | `src/pages/Experience.tsx` | Baixa (adicionar modalMode e handler) |

---

### Checklist de Validacoes

| Item | Validacao |
|------|-----------|
| Timeline nao aparece entre empresas diferentes | Condicional `showTimeline` |
| Timeline aparece quando 2+ cargos na mesma empresa | Prop baseada em `cargos.length > 1` |
| Dropdown menu funciona | Testes manuais de click |
| Editar ainda funciona | Funcionalidade mantida |
| Excluir ainda funciona | Funcionalidade mantida |
| Adicionar cargo pre-preenche empresa | Campo `empresa` disabled |
| Validacao de overlap de datas | Erro mostrado no toast |
| Lista atualiza apos adicionar cargo | `refetch()` chamado |

