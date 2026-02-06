
# Plano: Refatorar Filtros de Vagas com Combobox Multiple e Localizacao Hierarquica

## Resumo

Substituir os filtros atuais (acordeoes com checkboxes e input de texto para localizacao) por:
- 4 Combobox Multiple independentes para habilidades (um por categoria)
- 2 dropdowns hierarquicos (Estado > Cidade) usando API do IBGE

---

## Pre-requisito: Atualizar types.ts

O banco de dados ja foi migrado:
- Colunas `estado` (TEXT) e `cidade` (TEXT) existem na tabela `vagas`
- Coluna `localizacao` foi removida

Porem o arquivo `types.ts` ainda mostra a estrutura antiga. Sera necessario regenerar os tipos via Supabase CLI ou atualizar manualmente.

---

## Arquivos a Modificar

| Arquivo | Acao |
|---------|------|
| `src/components/ui/multi-select-combobox.tsx` | CRIAR |
| `src/integrations/supabase/types.ts` | ATUALIZAR (regenerar tipos) |
| `src/hooks/useJobFilters.ts` | EDITAR |
| `src/hooks/useJobs.ts` | EDITAR |
| `src/components/jobs/JobsSidebar.tsx` | REESCREVER |
| `src/pages/Jobs.tsx` | EDITAR |

---

## PARTE 1: Criar MultiSelectCombobox

Novo arquivo: `src/components/ui/multi-select-combobox.tsx`

Componente reutilizavel baseado nos componentes shadcn/ui existentes.

**Props:**
```text
options: { value: string; label: string }[]
selected: string[]
onSelectionChange: (values: string[]) => void
placeholder: string
searchPlaceholder?: string (default: "Buscar...")
emptyMessage?: string (default: "Nenhum item encontrado")
maxDisplayed?: number (default: 3)
disabled?: boolean
```

**Estrutura:**
- Button trigger mostrando badges dos itens selecionados
- Popover com Command (cmdk) para busca
- Checkbox visual em cada item
- Apos 3 badges, mostrar "+N" colapsado
- Cada badge tem botao X para remover
- Ao fechar popover, foco retorna para o trigger (acessibilidade)

**Componentes utilizados (ja existem):**
- `Popover`, `PopoverTrigger`, `PopoverContent`
- `Command`, `CommandInput`, `CommandList`, `CommandItem`, `CommandEmpty`, `CommandGroup`
- `Badge`
- `Checkbox`
- `Button`

---

## PARTE 2: Atualizar types.ts

A tabela `vagas` no banco ja tem:
- `estado: text` (2 caracteres, ex: "SP")
- `cidade: text` (ex: "Sao Paulo")

Mas o arquivo types.ts ainda mostra `localizacao: string | null`.

**Mudancas na interface `vagas`:**
```text
// REMOVER
localizacao: string | null

// ADICIONAR  
estado: string | null
cidade: string | null
```

---

## PARTE 3: Atualizar useJobFilters

Arquivo: `src/hooks/useJobFilters.ts`

**Tipo JobFilters - ANTES:**
```text
localizacao: string | null;
```

**Tipo JobFilters - DEPOIS:**
```text
estado: string | null;
cidade: string | null;
```

**Query params:**
- Remover: `local`
- Adicionar: `estado`, `cidade`

**Novas funcoes:**
```text
setEstado: (uf: string | null) => void
setCidade: (nome: string | null) => void
```

**Logica critica:**
- Ao chamar `setEstado(uf)`, tambem chamar `setCidade(null)` para limpar cidade

**Atualizar activeFilterCount:**
```text
// ANTES
if (filters.localizacao) count++;

// DEPOIS
if (filters.estado) count++;
if (filters.cidade) count++;
```

---

## PARTE 4: Atualizar useJobs

Arquivo: `src/hooks/useJobs.ts`

**Interface VagaListItem - Atualizar:**
```text
// REMOVER
localizacao: string | null;

// ADICIONAR
estado: string | null;
cidade: string | null;
```

**Interface JobFiltersParams - Atualizar:**
```text
// REMOVER
localizacao?: string | null;

// ADICIONAR
estado?: string | null;
cidade?: string | null;
```

**Query Supabase - Atualizar select (linhas 93-112):**
```text
// ANTES
localizacao,

// DEPOIS
estado,
cidade,
```

**Filtro de localizacao (linhas 128-130):**
```text
// ANTES
if (filters.localizacao) {
  query = query.ilike("localizacao", `%${filters.localizacao}%`);
}

// DEPOIS
if (filters.cidade && filters.estado) {
  query = query.eq("cidade", filters.cidade).eq("estado", filters.estado);
} else if (filters.estado) {
  query = query.eq("estado", filters.estado);
}
```

**Verificacao do filtro de modelo de trabalho (linhas 124-126):**
O codigo atual ja esta CORRETO:
```text
if (filters.modeloTrabalho) {
  query = query.eq("remoto", filters.modeloTrabalho as TipoTrabalho);
}
```

O enum `tipo_trabalho` tem valores: `["presencial", "hibrido", "remoto"]`
E o sidebar passa esses valores corretamente (verificado linhas 131-135 do JobsSidebar).

---

## PARTE 5: Reescrever JobsSidebar

Arquivo: `src/components/jobs/JobsSidebar.tsx`

**Remover completamente:**
- Componente `SkillCategoryCollapsible` (linhas 218-259)
- Imports de `Collapsible`, `CollapsibleContent`, `CollapsibleTrigger`
- Input de texto para localizacao (linhas 140-147)
- Badges de habilidades no topo (linhas 153-173)

**Adicionar imports:**
```text
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { useIBGELocations } from "@/hooks/useIBGELocations";
```

**Atualizar props:**
```text
interface JobsSidebarProps {
  filters: JobFilters;
  onFilterChange: (key: string, value: string | null) => void;
  onHabilidadesChange: (ids: string[]) => void;
  onEstadoChange: (uf: string | null) => void;   // NOVA
  onCidadeChange: (nome: string | null) => void; // NOVA
  onClearAll: () => void;
  activeFilterCount: number;
}
```

**Nova estrutura visual:**
```text
+------------------------------------------+
| Filtros                      [3 ativos]  |
+------------------------------------------+
| [Limpar filtros]                         |  <- MOVER PARA O TOPO
+------------------------------------------+
| Nivel                                    |
| [Select: Todos os niveis]                |
+------------------------------------------+
| Tipo de Contrato                         |
| [Select: Todos os tipos]                 |
+------------------------------------------+
| Modelo de Trabalho                       |
| [Select: Todos os modelos]               |
+------------------------------------------+
| Estado                                   |
| [Select: Selecione estado...]            |
|                                          |
|   Cidade                                 |  <- ml-4 indent
|   [Select: Selecione cidade...]          |  <- So aparece se estado
+------------------------------------------+
| Engines                                  |
| [Combobox: Unity, Unreal +1]             |
+------------------------------------------+
| Linguagens                               |
| [Combobox: C#, C++ +1]                   |
+------------------------------------------+
| Ferramentas                              |
| [Combobox: Blender, Git]                 |
+------------------------------------------+
| Soft Skills                              |
| [Combobox: Game Design]                  |
+------------------------------------------+
```

**Logica de habilidades:**
- Continuar usando `useAvailableSkills()` para buscar do banco
- Agrupar por `categoria`: `engine`, `linguagem`, `ferramenta`, `soft_skill`
- Para cada categoria, criar um `MultiSelectCombobox`
- Mapear habilidades para o formato `{ value: id, label: nome }`
- Ao selecionar, atualizar o array global `habilidades`

**Logica de localizacao:**
- Usar `useIBGELocations()` (hook ja existe)
- Ao montar: carregar estados via `fetchEstados()` (ja faz automaticamente)
- Ao selecionar estado: chamar `fetchMunicipios(uf)`
- Ao mudar estado: `onEstadoChange(uf)` que limpa cidade automaticamente
- Mostrar `estado.sigla` no dropdown com `estado.nome` como label visivel
- Cidade so aparece se estado selecionado

**Formato da API do IBGE (confirmado no hook existente):**
```text
Estados: { id, sigla, nome }  <- sigla="SP", nome="Sao Paulo"
Municipios: { id, nome }      <- nome="Sao Paulo"
```

**Inicializacao com URL:**
- useEffect ao montar que verifica `?estado=SP`
- Se existir, chamar `fetchMunicipios("SP")`
- Se existir `?cidade=...`, pre-selecionar apos carregar municipios

---

## PARTE 6: Atualizar Jobs.tsx

Arquivo: `src/pages/Jobs.tsx`

**Adicionar novas funcoes do useJobFilters:**
```text
const {
  filters,
  setFilter,
  setHabilidades,
  setEstado,        // NOVA
  setCidade,        // NOVA
  clearAllFilters,
  activeFilterCount,
  hasActiveFilters
} = useJobFilters();
```

**Atualizar filtersKey (linha ~56):**
```text
const filtersKey = JSON.stringify({
  nivel: filters.nivel,
  tipoContrato: filters.tipoContrato,
  modeloTrabalho: filters.modeloTrabalho,
  estado: filters.estado,      // TROCAR de localizacao
  cidade: filters.cidade,      // ADICIONAR
  habilidades: filters.habilidades,
  searchText: debouncedSearch
});
```

**Atualizar queryFilters (linha ~72):**
```text
const queryFilters = {
  nivel: filters.nivel,
  tipoContrato: filters.tipoContrato,
  modeloTrabalho: filters.modeloTrabalho,
  estado: filters.estado,      // TROCAR
  cidade: filters.cidade,      // ADICIONAR
  habilidades: filters.habilidades,
  searchText: debouncedSearch,
  pageSize: 20,
  cursor: currentCursor
};
```

**Atualizar props do JobsSidebar (linha ~115):**
```text
<JobsSidebar
  filters={filters}
  onFilterChange={setFilter}
  onHabilidadesChange={setHabilidades}
  onEstadoChange={setEstado}     // NOVA
  onCidadeChange={setCidade}     // NOVA
  onClearAll={handleClearAll}
  activeFilterCount={activeFilterCount}
/>
```

---

## Consideracoes Tecnicas

### Performance
- Estados carregados 1x ao montar (cache no hook)
- Municipios carregados sob demanda por UF (cache no hook)
- Habilidades com staleTime de 10 minutos via useAvailableSkills
- Sem debounce necessario (sao selects, nao inputs)

### Acessibilidade
- Command (cmdk) ja e acessivel por padrao
- Focus trap no Popover
- Navegacao por teclado nos itens
- Foco retorna para trigger ao fechar popover

### Checklist de Confirmacao
- [x] MultiSelectCombobox expande ate 3-4 badges antes de colapsar
- [x] Foco retorna para trigger ao fechar popover
- [x] Habilidades vem do banco via useAvailableSkills
- [x] Formato da API do IBGE confirmado no hook existente
- [x] Filtro de Modelo de Trabalho ja funciona corretamente (enum)
- [x] Botao "Limpar filtros" movido para o topo
- [x] activeFilterCount inclui estado e cidade
- [x] Ao mudar estado, cidade e limpa automaticamente
