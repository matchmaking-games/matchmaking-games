

## TASK-906: Converter ProjectForm para pagina e integrar editor rich text

Conversao do formulario de projetos de um Dialog modal para uma pagina dedicada com URL propria, e integracao do editor rich text BlockNote.

---

### Arquivos que serao criados

**1. `src/pages/dashboard/ProjectFormPage.tsx`**

Nova pagina que substitui o Dialog modal para criacao e edicao de projetos. Sera usada em duas rotas:
- `/dashboard/projects/new` (criacao)
- `/dashboard/projects/:id/edit` (edicao)

Estrutura da pagina:
- Usa `DashboardLayout` como wrapper (mesmo padrao das outras paginas do dashboard)
- Header com botao "Voltar" (ArrowLeft + texto) que navega para `/dashboard/profile/projects`
- Card principal centralizado (max-w-4xl mx-auto) com CardHeader, CardContent e CardFooter
- CardHeader com titulo dinamico ("Novo Projeto" ou "Editar Projeto")
- CardContent com todos os campos do formulario
- CardFooter com botoes "Cancelar" (ghost) e "Salvar Projeto" (primario)

Logica do formulario (copiada do ProjectForm.tsx atual com ajustes):
- Usa `useParams()` para detectar se tem `:id` na URL (modo edicao)
- Usa `useNavigate()` para navegacao
- Em modo edicao, busca o projeto pelo id usando `useProjects().projects`
- Schema Zod identico ao atual, exceto:
  - Remove campo `video_url`
  - Reduz `descricao` de max(1000) para max(300)
- Todos os campos existentes sao mantidos: titulo, slug, imagem de capa, tipo, papel, descricao, status, demo_url, codigo_url, habilidades, destaque

Integracao do editor rich text:
- Estado `richContent` separado do react-hook-form: `useState<string | null>(null)`
- Em modo edicao, inicializa com `JSON.stringify(projeto.descricao_rich)` se nao for null
- Secao apos o campo descricao com Label "Descricao Completa (Opcional)", texto de ajuda e o componente `RichTextEditor`
- Container com `min-h-[300px]` ao redor do editor
- No onSubmit, inclui `descricao_rich: richContent ? JSON.parse(richContent) : null`

---

### Arquivos que serao alterados

**2. `src/App.tsx`**

Adicionar duas rotas protegidas:
```text
/dashboard/projects/new        -> ProjectFormPage
/dashboard/projects/:id/edit   -> ProjectFormPage
```

Ambas dentro de `ProtectedRoute`, seguindo o padrao existente.

**3. `src/pages/Projects.tsx`**

Remover toda a logica do Dialog modal:
- Remover estados `isModalOpen` e `editingProject`
- Remover import e uso do componente `ProjectForm`
- Alterar `handleAdd` para `navigate("/dashboard/projects/new")`
- Alterar `handleEdit` para `navigate("/dashboard/projects/" + project.id + "/edit")`
- Manter: logica de delete (ProjectDeleteDialog), toggleDestaque, listagem

---

### O que NAO muda

- `useProjects` hook — logica de CRUD no banco inalterada
- `ProjectsList`, `ProjectCard`, `ProjectDeleteDialog` — inalterados
- `ProjectImageUpload`, `ProjectSkillsSelect` — reutilizados na nova pagina
- `ProjectsSection` (perfil publico) — inalterado
- Coluna `video_url` no banco — permanece, so sai da UI
- `schema.ts`, `YouTubeBlock.tsx`, `RichTextEditor.tsx` — inalterados

---

### Detalhes tecnicos

A pagina usa scroll nativo do browser (sem ScrollArea customizado) porque o editor BlockNote precisa disso para funcionar corretamente.

O formulario dentro da pagina usa `react-hook-form` com `zodResolver` e os componentes `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` do shadcn/ui — mesmo padrao do formulario atual.

O `RichTextEditor` fica fora do controle do react-hook-form (estado separado via useState) porque o BlockNote gerencia seu proprio estado interno. O valor e sincronizado manualmente no onSubmit.

Para modo edicao, a pagina usa `useProjects()` para obter a lista de projetos e filtra pelo id da URL. Se o projeto nao for encontrado e nao estiver carregando, exibe mensagem de erro ou redireciona.

