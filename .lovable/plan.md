

# Plano: Migracao de tipo_funcao + Fixes de UX (revisado)

## Arquivos a criar
- `src/hooks/useTiposFuncao.ts`

## Arquivos a modificar
- `src/pages/studio/JobForm.tsx`
- `src/hooks/useJobForm.ts`
- `src/components/studio/JobSkillsSelector.tsx`

---

## 1. Criar hook `useTiposFuncao`

Novo arquivo `src/hooks/useTiposFuncao.ts`. Busca todos os registros de `tipos_funcao` onde `ativo = true`, ordenados por `ordem`. Retorna `{ tiposFuncao: { id: string, nome: string }[], loading: boolean, error: string | null }`. Query executada uma unica vez no mount via `useState` + `useEffect` (sem React Query, seguindo padrao dos outros hooks do projeto).

---

## 2. Corrigir scroll do `JobSkillsSelector.tsx`

Linha 117: trocar `className="max-h-[200px]"` por `className="h-[200px]"` no `ScrollArea`. Isso forca altura fixa e ativa o scroll interno corretamente.

---

## 3. Modificar `useJobForm.ts`

### 3.1 Atualizar interfaces
- Em `VagaFormData`: remover `tipo_funcao: string[]`, adicionar `tipo_funcao_ids: string[]` (array de UUIDs).
- Em `VagaCompleta`: remover `tipo_funcao: string[]` (campo antigo nao e mais usado).

### 3.2 Criar funcao `insertTiposFuncao`
Nova funcao interna que recebe `(vagaId: string, tipoFuncaoIds: string[])` e insere registros em `vaga_tipos_funcao`. Padrao identico a `insertSkills`.

### 3.3 Atualizar todos os fluxos de salvamento
Nos 5 fluxos (`saveDraft`, `updateDraft`, `createJob gratuita`, `createJob destaque`, `updateJob`):
- Parar de enviar `tipo_funcao` na coluna da tabela `vagas`. O campo `tipo_funcao` da tabela `vagas` e `NOT NULL`, entao enviar um array vazio `[]` como placeholder.
- Apos inserir/atualizar a vaga, chamar `insertTiposFuncao(vagaId, data.tipo_funcao_ids)`.
- Em `updateJob` e `updateDraft`: deletar registros existentes em `vaga_tipos_funcao` antes de inserir (mesmo padrao do delete+insert de `vaga_habilidades`).

### 3.4 Carregar tipos de funcao ao editar
No Effect 2 (fetchJobData), apos carregar habilidades, buscar tambem os registros de `vaga_tipos_funcao` onde `vaga_id = jobId`. Armazenar os `tipo_funcao_id` em novo campo do retorno: `existingTiposFuncao: string[]`.

---

## 4. Modificar `JobForm.tsx`

### 4.1 Remover constante hardcoded
Remover `tipoFuncaoOptions` (linhas 58-74).

### 4.2 Importar e usar `useTiposFuncao`
Chamar o hook e usar `tiposFuncao` para popular o seletor.

### 4.3 Adaptar form para UUIDs
- O campo `tipo_funcao` do Zod schema continua como `z.array(z.string())` (agora armazena UUIDs em vez de nomes).
- Em `transformFormData`: mapear `tipo_funcao` do form para `tipo_funcao_ids` do `VagaFormData`.
- Nos badges selecionados: exibir o `nome` da funcao fazendo lookup no array `tiposFuncao` pelo ID.
- No `handleTipoFuncaoSelect`/`handleTipoFuncaoRemove`: trabalhar com IDs.

### 4.4 Carregar dados existentes
No useEffect que faz `form.reset` com `existingJob`, popular `tipo_funcao` com os IDs vindos de `existingTiposFuncao`. Sem fallback — se vazio, campo aparece vazio.

### 4.5 Corrigir scroll do CommandList
Adicionar `className="max-h-[200px] overflow-y-auto"` ao `CommandList` (linha 540).

### 4.6 Loading state no seletor
Enquanto `useTiposFuncao` estiver carregando, mostrar texto "Carregando..." no botao trigger do Popover e desabilitar o botao.

---

## Ordem de implementacao

1. Criar `useTiposFuncao.ts`
2. Corrigir `JobSkillsSelector.tsx` (1 linha)
3. Modificar `useJobForm.ts` (interfaces, insertTiposFuncao, fluxos de save, load)
4. Modificar `JobForm.tsx` (remover constante, usar hook, adaptar para IDs, corrigir scroll)

## O que NAO muda
- Layout visual do formulario
- Fluxo Stripe
- Validacao Zod (estrutura identica, conteudo muda de texto para UUID)
- Outros hooks e componentes
- Coluna `tipo_funcao` da tabela `vagas` (permanece no banco, recebe `[]` como placeholder)

