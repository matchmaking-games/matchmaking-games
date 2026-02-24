

## Fix: Correcoes no ProjectFormPage

Oito correcoes no arquivo `src/pages/dashboard/ProjectFormPage.tsx`. Uma correcao menor no `src/components/projects/ProjectSkillsSelect.tsx`.

---

### Correcao 1 — Botao "+" do editor faz submit do formulario

Reestruturar o JSX para que o `RichTextEditor` fique **fora** do elemento `<form>`, mas ainda dentro do `<Card>`:

```text
<Card>
  <CardHeader>...</CardHeader>

  <form onSubmit={form.handleSubmit(onSubmit)}>
    <CardContent>
      ... todos os campos do react-hook-form ...
    </CardContent>
  </form>

  <CardContent>
    ... bloco do RichTextEditor (fora do form) ...
  </CardContent>

  <CardFooter>
    ... botoes Cancelar e Salvar ...
  </CardFooter>
</Card>
```

O botao "Salvar" muda de `type="submit"` para `type="button"` com `onClick={() => form.handleSubmit(onSubmit)()}`.

---

### Correcao 2 — Dois fundos diferentes no editor

Remover `rounded-md border border-border` do container do editor. Fica apenas `min-h-[300px]`.

---

### Correcao 3 — Mover editor para o final

O bloco do editor (Label + texto de ajuda + RichTextEditor) sera movido para **apos** o campo "Destaque", tornando-se o ultimo elemento antes dos botoes. Ordem final:

1. Titulo
2. Slug
3. Imagem de capa
4. Tipo + Papel
5. Descricao breve
6. Status
7. Links
8. Habilidades
9. Destaque
10. Editor rich text

---

### Correcao 4 — Editor obrigatorio com validacao

- Label com asterisco vermelho: `Descricao do Projeto <span class="text-destructive">*</span>`
- Texto de ajuda atualizado: "Descreva o projeto com detalhes. Suporta texto formatado, listas, imagens e videos do YouTube."
- Validacao manual no inicio do `onSubmit`:
  - Se `richContent` for null ou igual ao JSON de um paragrafo vazio, exibe toast destrutivo e retorna sem salvar

---

### Correcao 5 — URL da slug errada

Trocar `matchmaking.games/p/{userSlug}#{slugValue}` por `matchmaking.games/p/{userSlug}/project/{slugValue}`.

---

### Correcao 6 — Aviso ao sair com dados nao salvos

- Novo estado `richContentDirty` (boolean, default false)
- No `onChange` do editor: marca `richContentDirty = true`
- Funcao `handleNavigateBack` que verifica `form.formState.isDirty || richContentDirty` e exibe `window.confirm` antes de navegar
- Usada nos botoes "Voltar para projetos", "Cancelar" e no bloco "Projeto nao encontrado"
- Apos submit bem-sucedido: zera `richContentDirty` e faz `form.reset(values)` antes de navegar

---

### Correcao 7 — Limite de habilidades para 20

No `ProjectFormPage.tsx`: trocar `maxSkills={10}` para `maxSkills={20}`.

O texto de ajuda no `ProjectSkillsSelect.tsx` ja usa `{maxSkills}` dinamicamente (linha 198), entao nao precisa de alteracao la.

---

### Correcao 8 — Adicionar status "Pausado"

- Schema Zod: `status: z.enum(["em_andamento", "concluido", "pausado"])`
- RadioGroup: adicionar terceira opcao com value "pausado" e label "Pausado"

---

### Arquivos alterados

1. `src/pages/dashboard/ProjectFormPage.tsx` — todas as 8 correcoes
2. Nenhum outro arquivo precisa ser alterado

### O que NAO muda

- `RichTextEditor.tsx`, `schema.ts`, `YouTubeBlock.tsx`
- `useProjects` hook
- `ProjectSkillsSelect.tsx` (o texto de ajuda ja e dinamico)
- Qualquer outro componente

