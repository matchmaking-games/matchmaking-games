

# Redesign da Pagina Publica de Projeto

## Objetivo
Reescrever completamente o arquivo `src/pages/ProjectDetail.tsx` para melhorar a hierarquia visual, compactar o topo, eliminar informacoes duplicadas e corrigir problemas de inconsistencia visual no BlockNote.

## Arquivo alterado
- `src/pages/ProjectDetail.tsx` (unico arquivo modificado)

## Mudancas detalhadas

### 1. Remocoes
- Remover os objetos `typeColors`, `statusColors`, `categoryColors` (badges coloridas eliminadas)
- Remover a funcao `formatProjectPeriod` (card "Detalhes" lateral removido)
- Remover imports nao mais utilizados: `Badge`, `AspectRatio`, `Calendar`, `Briefcase`, `Play`, `Code`, `format`, `ptBR`
- Adicionar import de `ChevronRight` do lucide-react
- Remover toda a sidebar lateral (`<aside>`) com card "Detalhes", card "Links" e card "Estudios"
- Remover o layout de 2 colunas (`flex-col lg:flex-row`)

### 2. Hero image condicional
- Se `project.imagem_capa_url` existir: renderizar `<img>` com `w-full aspect-video object-cover rounded-b-lg`
- Se nao existir: nao renderizar nada (sem placeholder, sem espaco reservado)

### 3. Titulo e metadados
- Titulo em `text-3xl font-bold` (sem `font-display` para manter Geist Sans como corpo)
- Abaixo: texto simples `text-sm text-muted-foreground` com tipo e status separados por ` · ` (ponto medio)
- Usa `formatTipoProjeto` e `formatStatusProjeto` existentes

### 4. Card do autor redesenhado
- `Link` para `/p/{owner.slug}` com `flex items-center gap-3 rounded-lg p-3 hover:bg-accent cursor-pointer transition-colors`
- Avatar 36px (`w-9 h-9`) com fallback de iniciais
- Lado direito do avatar: nome + pronomes na primeira linha, titulo profissional na segunda linha (indentado com o nome)
- `ChevronRight` 16px no canto direito via `ml-auto`

### 5. Descricao breve
- Se `project.descricao` existir: paragrafo simples `text-sm text-muted-foreground leading-relaxed`, sem card, sem titulo
- Se nao existir: nada renderizado

### 6. Habilidades e Softwares (dois cards em grid)
- Filtrar skills por `categoria === "habilidades"` e `categoria === "softwares"`
- Grid `grid-cols-1 sm:grid-cols-2 gap-4` quando ambos existem
- Se apenas um grupo existir: `grid-cols-1`
- Se nenhum skill existir: secao inteira omitida
- Dentro de cada card: `CardTitle text-sm font-semibold`, tags como `bg-muted text-foreground text-xs rounded-md px-2 py-1` em `flex flex-wrap gap-2`

### 7. Card de Links (largura total)
- Movido da sidebar para o conteudo principal
- Botoes lado a lado em `flex flex-wrap gap-3`
- Demo: variante primaria com emoji "Jogar / Ver Demo"
- Codigo: variante outline com "</> Ver Codigo"
- Card inteiro omitido se nenhum link existir

### 8. Card "Descricao Completa" com RichTextViewer
- Renderizado apenas se `project.descricao_rich` existir
- Wrapper `<div>` ao redor do `RichTextViewer` com classes:
  - `[&_.bn-editor]:bg-transparent` (remove fundo duplo)
  - `[&_.bn-block-outer]:bg-transparent` (remove fundo duplo)
  - `[&_.bn-editor]:pl-0` (remove padding esquerdo dos botoes de edicao)

### 9. Card "Estudios Colaboradores"
- Mantido, movido para apos descricao completa (largura total)
- Mesmo comportamento atual (Link se slug existir, div se nao)

### 10. Espacamento
- Container principal: espacamento compacto
- `mt-4` entre hero e titulo
- `mt-3` entre titulo e card do autor
- `mt-2` entre card do autor e descricao breve
- `mt-6` entre descricao breve e secao de conteudo (habilidades, links, descricao completa)
- `space-y-4` entre os cards de conteudo

### 11. Skeleton atualizado
- Remover skeleton da sidebar
- Manter skeleton do hero, titulo e conteudo em coluna unica

## Secao tecnica

```text
Layout final (single column):

+------------------------------------------+
| < Voltar ao perfil                       |
+------------------------------------------+
| [Hero 16:9 — only if image exists]       |
+------------------------------------------+
| Titulo do Projeto            (mt-4)      |
| Profissional · Em desenvolvimento        |
+------------------------------------------+
| [Avatar] Nome  Pronomes    [>]  (mt-3)   |
|          Titulo profissional             |
+------------------------------------------+
| Descricao breve em texto simples  (mt-2) |
+------------------------------------------+
|                                   (mt-6) |
| +------------------+  +---------------+  |
| | Habilidades      |  | Softwares     |  |
| | [tag] [tag] [tag]|  | [tag] [tag]   |  |
| +------------------+  +---------------+  |
|                                          |
| +--------------------------------------+ |
| | Links                                | |
| | [Jogar/Demo]  [Ver Codigo]           | |
| +--------------------------------------+ |
|                                          |
| +--------------------------------------+ |
| | Descricao Completa                   | |
| | [RichTextViewer — bg transparent]    | |
| +--------------------------------------+ |
|                                          |
| +--------------------------------------+ |
| | Estudios Colaboradores               | |
| | [Avatar] Nome do Estudio             | |
| +--------------------------------------+ |
+------------------------------------------+
```

Nenhum outro arquivo sera alterado.
