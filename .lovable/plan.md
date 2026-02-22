

## Plano: Agrupar cargos por empresa na importacao do LinkedIn + campos de localizacao nos cards

### Resumo

Tres camadas de alteracao: (1) prompt do Gemini para retornar experiencias agrupadas por empresa com array de cargos, sem localizacao, (2) ImportReviewDrawer com flatten para cards + campos de modalidade/estado/cidade com validacao, (3) useImportSave com reagrupamento por empresa e insercao em cargos_experiencia.

---

### Arquivo 1: `supabase/functions/process-linkedin-pdf/index.ts`

**Alteracao no prompt (funcao buildPrompt):**

Substituir a regra "Se a pessoa teve multiplos cargos na mesma empresa, crie entradas SEPARADAS" pela regra inversa: agrupar cargos da mesma empresa.

Remover completamente o campo `location` de experiences e de `basic_info`.

Nova estrutura de experiences no JSON pedido ao Gemini:

```text
"experiences": [
  {
    "company": "nome da empresa",
    "cargos": [
      {
        "role": "titulo do cargo",
        "tipo_emprego": "clt | pj | freelancer | estagio | tempo_integral",
        "start_date": "YYYY-MM ou null",
        "end_date": "YYYY-MM ou null",
        "is_current": true/false,
        "description": "descricao completa ou string vazia"
      }
    ]
  }
]
```

Regras no prompt:
- Se multiplos cargos na mesma empresa (indentados ou entradas separadas com mesmo nome), agrupar no mesmo objeto
- Cargos ordenados do mais recente para o mais antigo dentro do array
- Para empresa com cargo unico, o array cargos tem 1 item
- SEMPRE retornar a estrutura com array cargos, nunca flat
- Nao extrair localizacao de experiencias

O restante do prompt (education, skills, basic_info, regras de datas, tipo_emprego, tipo educacao) permanece igual, exceto remover `location` de basic_info e de experiences.

---

### Arquivo 2: `src/components/ImportReviewDrawer.tsx`

**Alteracao 1 — Tipo ReviewExperience (linhas 47-55):**

Mudar `modalidade` de obrigatorio para nullable:

```text
export interface ReviewExperience {
  empresa: string;
  titulo_cargo: string;
  tipo_emprego: "clt" | "pj" | "freelancer" | "estagio" | "tempo_integral";
  modalidade: "presencial" | "hibrido" | "remoto" | null;
  estado: string | null;
  cidade: string | null;
  inicio: string;
  fim: string | null;
  descricao: string;
}
```

Adicionar `estado` e `cidade` ao tipo.

**Alteracao 2 — Mapeamento handleFileSelect (linhas 344-352):**

Flatten da nova estrutura agrupada por empresa:

```text
const mappedExperiences: ReviewExperience[] = [];
const extractedExps = (result.extracted_data?.experiences as any[]) ?? [];
for (const exp of extractedExps) {
  const cargos = Array.isArray(exp.cargos) ? exp.cargos : [exp];
  for (const cargo of cargos) {
    mappedExperiences.push({
      empresa: exp.company || cargo.company || "",
      titulo_cargo: cargo.role || "",
      tipo_emprego: cargo.tipo_emprego || "clt",
      modalidade: null,
      estado: null,
      cidade: null,
      inicio: cargo.start_date || "",
      fim: cargo.end_date || null,
      descricao: cargo.description || "",
    });
  }
}
```

Fallback: se `exp.cargos` nao existir (formato antigo), tratar `exp` como cargo unico.

**Alteracao 3 — ExperienceReviewCard (linhas 110-232):**

Adicionar estado interno `validationTriggered` (boolean, comeca false). Esse estado sera setado para true quando o handleSave for chamado.

Adicionar estado interno para IBGE: `municipios` e `loadingMunicipios` (cada card gerencia seus proprios municipios). Os estados do IBGE serao recebidos via props (buscados uma unica vez no componente pai).

**Importante sobre useIBGELocations:** O hook busca estados no mount e expoe `fetchMunicipios(uf)` que atualiza um unico array de municipios. Como temos multiplos cards, cada card precisa de seus proprios municipios. Solucao: cada ExperienceReviewCard chama a API do IBGE diretamente (fetch inline) quando o estado muda, armazenando os municipios em estado local do card. Os estados (UF) sao compartilhados via prop `estadosIBGE` passada do componente pai que usa o hook.

Layout do card atualizado (apos os campos de datas):

```text
Grid 2 colunas:
  [Tipo de contrato] [Modalidade *]

Se modalidade = "presencial" ou "hibrido":
  Grid 2 colunas:
    [Estado *] [Cidade *]
```

Campo Modalidade:
- Select com placeholder "Selecione a modalidade"
- Label: "Modalidade" com asterisco vermelho
- Quando muda para "remoto", limpar estado e cidade para null
- Quando muda para presencial/hibrido, manter estado e cidade

Campo Estado:
- Select com as opcoes de `estadosIBGE` (prop)
- Label: "Estado" com asterisco vermelho
- Placeholder: "Selecione o estado"
- Quando muda, buscar municipios da API IBGE e limpar cidade

Campo Cidade:
- Select com as opcoes de municipios locais do card
- Label: "Cidade" com asterisco vermelho
- Placeholder: "Selecione a cidade"
- Desabilitado enquanto estado nao for selecionado ou loadingMunicipios

Validacao visual (apenas quando `validationTriggered` = true):
- Modalidade vazia: texto vermelho "Selecione uma modalidade antes de salvar"
- Estado vazio (quando presencial/hibrido): "Selecione o estado antes de salvar"
- Cidade vazia (quando presencial/hibrido): "Selecione a cidade antes de salvar"
- Empresa vazia: "Preencha este campo antes de salvar"
- Titulo cargo vazio: "Preencha este campo antes de salvar"

O `validationTriggered` sera controlado via prop, setado pelo componente pai quando o usuario clicar "Confirmar e Salvar".

**Alteracao 4 — Componente pai (main drawer):**

Adicionar estado `validationTriggered` (boolean) no componente principal.

Chamar `useIBGELocations()` no componente pai para buscar estados uma vez. Passar `estadosIBGE` como prop para cada ExperienceReviewCard.

No `handleSave`:
1. Antes de chamar `saveImportData`, validar todos os campos obrigatorios
2. Se algum campo invalido, setar `validationTriggered = true` e mostrar toast "Preencha todos os campos obrigatorios antes de confirmar a importacao."
3. Se tudo valido, prosseguir com o salvamento

Funcao de validacao:

```text
function validateExperiences(exps: ReviewExperience[]): boolean {
  return exps.every(exp => {
    if (!exp.empresa || !exp.titulo_cargo || !exp.modalidade) return false;
    if ((exp.modalidade === "presencial" || exp.modalidade === "hibrido") && (!exp.estado || !exp.cidade)) return false;
    return true;
  });
}
```

---

### Arquivo 3: `src/hooks/useImportSave.ts`

**Alteracao na logica de insercao de experiencias (Step 4):**

1. Agrupar ReviewExperience por nome de empresa (trim + lowercase para comparacao, preservar nome original)

2. Para cada grupo de empresa:

**Caso A — Cargo unico (1 item no grupo):**
Inserir apenas em "experiencia" (comportamento atual), incluindo cidade, estado e remoto do ReviewExperience:

```text
{
  user_id: user.id,
  empresa: exp.empresa,
  titulo_cargo: exp.titulo_cargo,
  tipo_emprego: exp.tipo_emprego,
  remoto: exp.modalidade,
  cidade: (exp.modalidade === "remoto") ? null : exp.cidade,
  estado: (exp.modalidade === "remoto") ? null : exp.estado,
  inicio: exp.inicio,
  fim: exp.fim || null,
  atualmente_trabalhando: !exp.fim,
  descricao: exp.descricao || "",
  ordem: empresaIndex,
}
```

Nao inserir em cargos_experiencia.

**Caso B — Multiplos cargos (2+ itens no grupo):**

a. Ordenar cargos por inicio decrescente para determinar o mais recente

b. Calcular campos do registro pai:
   - titulo_cargo = cargo mais recente
   - tipo_emprego = cargo mais recente
   - inicio = menor data entre todos os cargos
   - fim = maior data, ou null se algum cargo tem fim null
   - atualmente_trabalhando = true se algum cargo tem fim null
   - descricao = descricao do cargo mais recente
   - remoto/cidade/estado = do cargo mais recente

c. Inserir em "experiencia" com `.select("id").single()` para obter o id

d. Inserir N registros em "cargos_experiencia":

```text
{
  experiencia_id: parentId,
  titulo_cargo: cargo.titulo_cargo,
  tipo_emprego: cargo.tipo_emprego,
  inicio: cargo.inicio ? cargo.inicio + "-01" : null,  // YYYY-MM -> YYYY-MM-DD
  fim: cargo.fim ? cargo.fim + "-01" : null,
  atualmente_trabalhando: !cargo.fim,
  descricao: cargo.descricao || "",
  habilidades_usadas: null,
  ordem: index,  // 0 = mais recente
}
```

**Validacao antes de inserir:**

Antes de executar qualquer delete/insert, validar que todas as experiencias tem `modalidade` preenchida, e que experiencias presenciais/hibridas tem estado e cidade. Se invalido, lancar erro com mensagem "Preencha todos os campos obrigatorios antes de confirmar a importacao." sem executar nenhuma operacao no banco.

---

### Arquivos tocados

| Arquivo | Acao |
|---|---|
| `supabase/functions/process-linkedin-pdf/index.ts` | Editar prompt (agrupar cargos, remover location) |
| `src/components/ImportReviewDrawer.tsx` | Editar tipo, mapeamento, ExperienceReviewCard (modalidade/estado/cidade + validacao) |
| `src/hooks/useImportSave.ts` | Editar (agrupar por empresa, inserir cargos_experiencia, validacao) |

### O que NAO muda

- Hooks useExperiences e useEducations
- ExperienceModal e EducationModal
- ExperienceCard e ExperienceList (ja suportam timeline)
- Fluxo de upload do PDF
- Importacao de educacao
- Nenhuma biblioteca nova

