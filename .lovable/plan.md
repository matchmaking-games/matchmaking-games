

## TASK-907: Integrar RichTextViewer no ProjectDetail

Duas alteracoes em arquivos existentes. Nenhum arquivo novo.

---

### Arquivo 1: `src/hooks/useProjectDetail.ts`

**Adicionar `descricao_rich` ao tipo e aos SELECTs.**

- Na interface `ProjectDetailData.project`, adicionar `descricao_rich: any | null`
- Nas duas queries SELECT (linhas 63 e 76), adicionar `descricao_rich` a lista de colunas

---

### Arquivo 2: `src/pages/ProjectDetail.tsx`

**Passo 1 — Remover logica de embed legada:**

- Remover funcoes `extractYouTubeId` (linhas 46-57) e `extractVimeoId` (linhas 59-62)
- Remover variaveis `youtubeId` e `vimeoId` (linhas 187-193)
- Remover os dois blocos de Card com iframe de YouTube e Vimeo no JSX (linhas 291-321)
- Remover `Video` do import de lucide-react (linha 9)
- Remover o botao "Assistir Video" do card de Links (linhas 432-443)
- Atualizar `hasLinks` para nao incluir `video_url`: `const hasLinks = project.demo_url || project.codigo_url`

**Passo 2 — Adicionar RichTextViewer:**

- Adicionar import: `import { RichTextViewer } from "@/components/editor/RichTextViewer"`
- Apos o Card "Sobre o Projeto" (linha 289) e antes do Card de Skills, adicionar o bloco condicional:

```text
{project.descricao_rich && (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-base">Descricao Completa</CardTitle>
    </CardHeader>
    <CardContent>
      <RichTextViewer content={JSON.stringify(project.descricao_rich)} />
    </CardContent>
  </Card>
)}
```

**Limpeza de imports nao utilizados:**
- Remover `AspectRatio` se nao for mais usado em nenhum outro lugar (ainda e usado no hero image, entao permanece)
- Remover `ExternalLink` do import de lucide-react (ja nao e usado)

---

### O que NAO muda

- Card "Sobre o Projeto" com `project.descricao` — inalterado
- Logica de skills e estudios — inalterada
- Hero image — inalterado
- Sidebar de detalhes — inalterada (exceto remocao do botao de video)
- Nenhum outro arquivo do projeto
