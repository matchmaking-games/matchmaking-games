
# Atualizar Sistema de Projetos para Novo Schema do Banco

## Resumo

Atualizar o codigo para refletir as mudancas no banco de dados: remover campos deletados (`em_andamento`, `descricao_curta`, `descricao_completa`), usar o novo campo `descricao`, e atualizar o enum `status_projeto` de 3 para 2 valores (`em_andamento`, `concluido`).

## Arquivos a modificar (6 arquivos)

### 1. `src/integrations/supabase/types.ts`

Atualizar o tipo `projetos` (Row, Insert, Update):
- Remover `descricao_curta`, `descricao_completa`, `em_andamento`
- Adicionar `descricao: string | null` (Row) e `descricao?: string | null` (Insert/Update)
- Atualizar enum `status_projeto` de `"publicado" | "em_desenvolvimento" | "arquivado"` para `"em_andamento" | "concluido"`
- Atualizar o array de valores do enum tambem (na secao Enums)

### 2. `src/components/projects/ProjectForm.tsx`

**Schema Zod (linhas 24-36):**
- Renomear `descricao_curta` para `descricao` com `.max(1000, "Maximo 1000 caracteres")`
- Atualizar enum de status: `z.enum(["em_andamento", "concluido"])`

**Default values (linhas 95-107, 132-144):**
- `descricao_curta: ""` vira `descricao: ""`
- `status: "em_desenvolvimento"` vira `status: "em_andamento"`

**Reset ao editar (linhas 113-126):**
- `descricao_curta: editingProject.descricao_curta` vira `descricao: editingProject.descricao`

**onSubmit projectData (linhas 191-203):**
- `descricao_curta: values.descricao_curta` vira `descricao: values.descricao`

**Watch (linha 233):**
- `form.watch("descricao_curta")` vira `form.watch("descricao")` e renomear variavel para `descricaoValue`

**Campo do formulario (linhas 349-373):**
- Atualizar `name` para `"descricao"`, label para `"Descricao"`, `maxLength` para `1000`, contador para `/1000`
- Aumentar `rows` para 4

**Radio de status (linhas 375-413):**
- Remover opcao "Arquivado" (linhas 402-407)
- Mudar opcoes para:
  - `value="em_andamento"` label "Em desenvolvimento"
  - `value="concluido"` label "Concluido"

### 3. `src/components/projects/ProjectCard.tsx`

**Funcao `getStatusBadgeClasses` (linhas 32-39):**
- Remover entrada `arquivado`
- Renomear `publicado` para `concluido` e `em_desenvolvimento` para `em_andamento`

### 4. `src/lib/formatters.ts`

**Funcao `formatStatusProjeto` (linhas 144-151):**
- Remover `arquivado: "Arquivado"` e `publicado: "Publicado"`
- Adicionar `em_andamento: "Em desenvolvimento"` e `concluido: "Concluido"`

### 5. `src/hooks/usePublicProfile.ts`

**Tipo `PublicProjectData` (linha 39):**
- Renomear `descricao_curta` para `descricao`

**Query select (linha 150):**
- Trocar `descricao_curta` por `descricao` no select
- Remover `.neq("status", "arquivado")` (linha 155) - todos os projetos sao publicos

### 6. `src/components/public-profile/ProjectsSection.tsx`

**FeaturedProjectCard (linha 67-70):**
- `project.descricao_curta` vira `project.descricao`

**CompactProjectCard (linhas 97-100):**
- `project.descricao_curta` vira `project.descricao`

## O que NAO muda

- Logica de destaque (permanece igual)
- Estrutura de skills dos projetos
- Upload de imagens
- Hook `useProjects` (usa `select("*")` que ja reflete o banco automaticamente, mas as referencias a `descricao_curta` no ProjectForm serao atualizadas)
