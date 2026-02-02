

# Plano Revisado: Formulario de Publicacao e Edicao de Vagas

## Objetivo
Criar formulario completo para publicar e editar vagas do estudio, incluindo selecao de habilidades obrigatorias e desejaveis, geracao automatica de slug e validacao com Zod.

---

## Arquivos a Criar

**Arquivo 1:**
- Caminho: `src/pages/studio/JobForm.tsx`
- Descricao: Pagina principal do formulario (create/edit)

**Arquivo 2:**
- Caminho: `src/components/studio/JobSkillsSelector.tsx`
- Descricao: Componente de selecao de habilidades para vagas (baseado no ProjectSkillsSelect existente)

**Arquivo 3:**
- Caminho: `src/hooks/useJobForm.ts`
- Descricao: Hook para gerenciar logica de create/update

## Arquivos a Modificar

**Arquivo:**
- Caminho: `src/App.tsx`
- Alteracao: Adicionar rotas `/studio/jobs/new` e `/studio/jobs/:id/edit`

---

## Secao Tecnica

### 1. Estrutura de Dados

O campo `tipo_funcao` e um array de strings (sem enum definido no banco). Os valores serao armazenados como texto livre.

**Enums existentes no banco:**
- `nivel_vaga`: "iniciante" | "junior" | "pleno" | "senior" | "lead"
- `tipo_contrato`: "clt" | "pj" | "freelance" | "estagio"
- `tipo_trabalho` (campo remoto): "presencial" | "hibrido" | "remoto"
- `tipo_publicacao_vaga`: "gratuita" | "destaque"

**Campo `contato_candidatura`:** Ja existe na tabela vagas (string nullable)

---

### 2. Schema Zod com Transform (Correcao 2)

Seguindo o padrao do ExperienceModal.tsx, o schema transformara estado/cidade em localizacao:

```typescript
const vagaFormSchema = z.object({
  titulo: z.string()
    .min(5, "Minimo 5 caracteres")
    .max(100, "Maximo 100 caracteres"),
  
  tipo_funcao: z.array(z.string())
    .min(1, "Selecione pelo menos um tipo de funcao"),
  
  nivel: z.enum(["iniciante", "junior", "pleno", "senior", "lead"]),
  
  tipo_contrato: z.enum(["clt", "pj", "freelance", "estagio"]),
  
  remoto: z.enum(["presencial", "hibrido", "remoto"]),
  
  estado: z.string().optional(),
  cidade: z.string().optional(),
  
  contato_candidatura: z.string()
    .max(500, "Maximo 500 caracteres")
    .optional()
    .nullable(),
  
  salario_min: z.number().positive().nullable().optional(),
  salario_max: z.number().positive().nullable().optional(),
  mostrar_salario: z.boolean().default(false),
  
  descricao: z.string()
    .min(100, "Minimo 100 caracteres")
    .max(10000, "Maximo 10.000 caracteres"),
  
  tipo_publicacao: z.enum(["gratuita", "destaque"]).default("gratuita"),
  
  habilidades_obrigatorias: z.array(z.string()).default([]),
  habilidades_desejaveis: z.array(z.string()).default([]),
})
.refine(
  (data) => {
    if (data.salario_min && data.salario_max) {
      return data.salario_max >= data.salario_min;
    }
    return true;
  },
  { 
    message: "Salario maximo deve ser maior ou igual ao minimo",
    path: ["salario_max"]
  }
)
.transform((data) => {
  const { estado, cidade, ...rest } = data;
  
  return {
    ...rest,
    localizacao: estado && cidade ? `${cidade}, ${estado}` : null,
  };
});
```

---

### 3. Hook useJobForm.ts

**Responsabilidades:**
- Verificar permissao super_admin
- Buscar vaga existente (modo edicao)
- Buscar habilidades da vaga
- Criar nova vaga (com expira_em)
- Atualizar vaga existente (SEM expira_em - Correcao 6)
- Gerenciar habilidades (delete + insert)
- Verificar unicidade de slug (silenciosamente - Correcao 9)

**Estrutura:**
```typescript
interface UseJobFormReturn {
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  isAuthorized: boolean;
  estudioId: string | null;
  existingJob: VagaCompleta | null;
  existingSkills: {
    obrigatorias: string[];
    desejaveis: string[];
  };
  
  createJob: (data: VagaFormData) => Promise<void>;
  updateJob: (id: string, data: VagaFormData) => Promise<void>;
}
```

**Query completa para modo edicao (Correcao 4):**

```typescript
// Buscar vaga
const { data: vaga } = await supabase
  .from("vagas")
  .select("*")
  .eq("id", vagaId)
  .single();

// Buscar habilidades obrigatorias
const { data: habilidadesObrigatorias } = await supabase
  .from("vaga_habilidades")
  .select("habilidade_id")
  .eq("vaga_id", vagaId)
  .eq("obrigatoria", true);

// Buscar habilidades desejaveis
const { data: habilidadesDesejaveis } = await supabase
  .from("vaga_habilidades")
  .select("habilidade_id")
  .eq("vaga_id", vagaId)
  .eq("obrigatoria", false);

// Desmontar localizacao em estado e cidade
const [cidade, estado] = vaga.localizacao?.split(", ") || [null, null];

// Preencher form
form.setValue("estado", estado || "");
form.setValue("cidade", cidade || "");

// Se tiver estado, buscar municipios
if (estado) {
  fetchMunicipios(estado);
}
```

**Fluxo de criacao (CREATE):**
1. Validar dados com Zod
2. Gerar slug com `generateSlug(titulo)` do formatters.ts
3. Verificar unicidade e adicionar sufixo se necessario (silenciosamente)
4. Calcular `expira_em = addDays(new Date(), 30).toISOString()`
5. INSERT em vagas
6. INSERT habilidades obrigatorias (obrigatoria = true)
7. INSERT habilidades desejaveis (obrigatoria = false)
8. Toast sucesso + redirect

**Fluxo de edicao (UPDATE) - Correcao 6:**
1. Validar dados
2. Se titulo mudou, regerar slug e verificar unicidade (silenciosamente)
3. UPDATE em vagas (NAO incluir expira_em - manter valor original)
4. DELETE habilidades antigas
5. INSERT habilidades novas
6. Toast sucesso + redirect

---

### 4. Geracao Silenciosa de Slug (Correcao 9)

O slug e completamente invisivel para o usuario:

```typescript
// No hook useJobForm, ao salvar:
const generateUniqueSlug = async (titulo: string, excludeId?: string) => {
  const baseSlug = generateSlug(titulo); // Importar de @/lib/formatters
  let slug = baseSlug;
  let counter = 2;
  
  while (true) {
    let query = supabase
      .from("vagas")
      .select("id")
      .eq("slug", slug);
    
    if (excludeId) {
      query = query.neq("id", excludeId);
    }
    
    const { data } = await query.maybeSingle();
    
    if (!data) break; // Slug disponivel
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};
```

**NAO mostrar campo de slug na UI. Gerar nos bastidores ao salvar.**

---

### 5. Componente JobSkillsSelector.tsx

Baseado no ProjectSkillsSelect.tsx existente, com suporte a excludeSkillIds (Correcao 7):

```typescript
interface JobSkillsSelectorProps {
  label: string;
  helperText?: string;
  selectedSkillIds: string[];
  onSkillsChange: (skillIds: string[]) => void;
  excludeSkillIds?: string[];  // Evitar duplicatas entre obrig/desej
  disabled?: boolean;
  maxSkills?: number;
}

// No componente, filtrar habilidades disponiveis:
const filteredSkills = useMemo(() => {
  const notSelected = availableSkills.filter(
    (skill) =>
      !selectedSkillIds.includes(skill.id) &&
      !excludeSkillIds?.includes(skill.id) &&  // <-- Filtrar excluidas
      skill.nome.toLowerCase().includes(search.toLowerCase())
  );
  
  // Agrupar por categoria...
}, [availableSkills, selectedSkillIds, excludeSkillIds, search]);
```

**Uso no formulario:**
```typescript
{/* Habilidades obrigatorias */}
<JobSkillsSelector
  label="Habilidades obrigatorias"
  selectedSkillIds={habilidadesObrigatorias}
  onSkillsChange={setHabilidadesObrigatorias}
  excludeSkillIds={habilidadesDesejaveis}
/>

{/* Habilidades desejaveis */}
<JobSkillsSelector
  label="Habilidades desejaveis (diferenciais)"
  selectedSkillIds={habilidadesDesejaveis}
  onSkillsChange={setHabilidadesDesejaveis}
  excludeSkillIds={habilidadesObrigatorias}
/>
```

---

### 6. Lista de Tipos de Funcao (Correcao 3)

Como `tipo_funcao` e um array de strings (sem enum), usar valores em formato legivel:

```typescript
const tipoFuncaoOptions = [
  { value: "Programação", label: "Programação" },
  { value: "Arte 2D", label: "Arte 2D" },
  { value: "Arte 3D", label: "Arte 3D" },
  { value: "Game Design", label: "Game Design" },
  { value: "Level Design", label: "Level Design" },
  { value: "Narrative Design", label: "Narrative Design" },
  { value: "UI/UX", label: "UI/UX" },
  { value: "Audio", label: "Audio" },
  { value: "QA", label: "QA" },
  { value: "Producer", label: "Producer" },
  { value: "Marketing", label: "Marketing" },
  { value: "Community Manager", label: "Community Manager" },
  { value: "Technical Artist", label: "Technical Artist" },
  { value: "VFX", label: "VFX" },
  { value: "Animation", label: "Animation" },
];
```

---

### 7. Contador de Caracteres em Tempo Real (Correcao 8)

```typescript
const descricao = form.watch("descricao") || "";
const charCount = descricao.length;
const isValid = charCount >= 100 && charCount <= 10000;
const isTooShort = charCount > 0 && charCount < 100;

// No JSX, abaixo do Textarea:
<p className={cn(
  "text-xs text-right",
  isTooShort && "text-destructive",
  isValid && "text-green-500",
  !isTooShort && !isValid && "text-muted-foreground"
)}>
  {charCount} / 10.000
</p>
```

---

### 8. Campo de Contato para Candidatura (Correcao 10)

Adicionar na secao "Informacoes Basicas", apos Localizacao:

```typescript
<FormField
  control={form.control}
  name="contato_candidatura"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Como candidatos devem entrar em contato?</FormLabel>
      <FormControl>
        <Input 
          placeholder="Ex: vagas@estudio.com ou https://estudio.com/vagas"
          {...field}
          value={field.value || ""}
        />
      </FormControl>
      <p className="text-xs text-muted-foreground">
        Informe um email, link de formulário ou instruções de como se candidatar a esta vaga.
      </p>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

### 9. Verificacao de Permissao na UI (Correcao 5)

```typescript
const { isLoading, isAuthorized } = useJobForm();

if (!isLoading && !isAuthorized) {
  return <Navigate to="/studio/jobs" replace />;
}
```

---

### 10. Estrutura Visual - TUDO DENTRO DO CARD (CRITICO)

```typescript
export default function JobForm() {
  const { id } = useParams();
  const isEditing = !!id;
  
  // ... hooks e logica
  
  return (
    <StudioDashboardLayout>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/studio/jobs")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="font-display text-2xl">
              {isEditing ? "Editar Vaga" : "Criar Nova Vaga"}
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* SECAO: INFORMACOES BASICAS */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informacoes Basicas</h3>
                <Separator />
                
                {/* Titulo */}
                {/* Tipo de funcao (checkboxes) */}
                {/* Nivel (radio) */}
                {/* Tipo de contrato (radio) */}
                {/* Modelo de trabalho (radio) */}
                {/* Estado/Cidade (selects IBGE) */}
                {/* Contato para candidatura (textarea) */}
              </div>
              
              {/* SECAO: REMUNERACAO */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Remuneracao</h3>
                <Separator />
                
                {/* Salario min/max */}
                {/* Checkbox mostrar salario */}
              </div>
              
              {/* SECAO: DESCRICAO */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Descricao</h3>
                <Separator />
                
                {/* Textarea + contador */}
              </div>
              
              {/* SECAO: HABILIDADES */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Habilidades</h3>
                <Separator />
                
                {/* JobSkillsSelector obrigatorias */}
                {/* JobSkillsSelector desejaveis */}
              </div>
              
              {/* SECAO: TIPO DE PUBLICACAO */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tipo de Publicacao</h3>
                <Separator />
                
                {/* Radio gratuita/destaque */}
              </div>
              
              {/* BOTOES DE ACAO */}
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate("/studio/jobs")}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Salvando..." : (isEditing ? "Salvar Alteracoes" : "Publicar Vaga")}
                </Button>
              </div>
              
            </form>
          </Form>
        </CardContent>
      </Card>
    </StudioDashboardLayout>
  );
}
```

---

### 11. Rotas em App.tsx

```typescript
import JobForm from "./pages/studio/JobForm";

<Route
  path="/studio/jobs/new"
  element={
    <ProtectedRoute>
      <JobForm />
    </ProtectedRoute>
  }
/>
<Route
  path="/studio/jobs/:id/edit"
  element={
    <ProtectedRoute>
      <JobForm />
    </ProtectedRoute>
  }
/>
```

---

### 12. Componentes shadcn/ui Utilizados

- Form (react-hook-form)
- Input
- Textarea
- RadioGroup, RadioGroupItem
- Checkbox
- Select, SelectTrigger, SelectContent, SelectItem
- Button
- Card, CardHeader, CardTitle, CardContent
- Label
- Separator
- Popover, PopoverTrigger, PopoverContent
- ScrollArea
- Badge

---

### 13. Integracao com IBGE

Usar hook existente `useIBGELocations` (mesmo padrao do ExperienceModal):

```typescript
const { 
  estados, 
  loadingEstados, 
  municipios, 
  loadingMunicipios, 
  fetchMunicipios, 
  clearMunicipios 
} = useIBGELocations();

const handleEstadoChange = (uf: string) => {
  form.setValue("estado", uf);
  form.setValue("cidade", "");
  fetchMunicipios(uf);
};

const handleCidadeChange = (cidade: string) => {
  form.setValue("cidade", cidade);
};
```

---

## Resumo das Correcoes Aplicadas

**Correcao 1:** Tabelas markdown removidas, usando topicos

**Correcao 2:** Schema Zod com transform para estado/cidade -> localizacao

**Correcao 3:** tipo_funcao usa valores legiveis ("Programacao", "Arte 2D") pois nao ha enum no banco

**Correcao 4:** Query completa para modo edicao + desmontar localizacao em estado/cidade

**Correcao 5:** Redirect com Navigate se nao autorizado

**Correcao 6:** expira_em calculado apenas no CREATE, nao no UPDATE

**Correcao 7:** excludeSkillIds implementado para evitar duplicatas entre obrigatorias/desejaveis

**Correcao 8:** Contador de caracteres em tempo real com cores (vermelho < 100, verde >= 100)

**Correcao 9:** Slug gerado silenciosamente nos bastidores, sem feedback visual para usuario

**Correcao 10:** Campo contato_candidatura adicionado na secao Informacoes Basicas

**CRITICO:** Todo conteudo dentro do Card (botao voltar, titulo, formulario, botoes de acao)

---

## Fluxo de Implementacao

1. Criar hook `useJobForm.ts` com logica de permissao, fetch e save
2. Criar componente `JobSkillsSelector.tsx` baseado no ProjectSkillsSelect existente
3. Criar pagina `JobForm.tsx` com formulario completo
4. Adicionar rotas em `App.tsx`
5. Testar fluxos: criacao, edicao, habilidades, validacoes

