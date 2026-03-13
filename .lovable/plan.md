
## Plano: Hook useStudioProject + Página StudioProjectDetail

Criar dois arquivos novos que trabalham juntos — o hook de busca de dados e a página de detalhe de projeto de estúdio.

### Arquivo 1: `src/hooks/useStudioProject.ts`

Hook simples seguindo o padrão de `useProjectDetail` e `usePublicStudio`:

```typescript
interface StudioProjectData {
  // Campos do projeto + estúdio aninhado
  id, titulo, descricao, tipo, status, engine, plataformas, genero,
  imagem_capa_url, demo_url, codigo_url, steam_url, ...
  estudio: { id, nome, slug, logo_url }
}
```

- Query: `supabase.from('projetos').select('*, estudio:estudios(id, nome, slug, logo_url)').eq('slug', projectSlug).maybeSingle()`
- React Query com `staleTime: 30000`, queryKey: `["studio-project", projectSlug]`
- Retorna `{ project, isLoading, error }`

### Arquivo 2: `src/pages/StudioProjectDetail.tsx`

Página pública simplificada, seguindo o layout de `ProjectDetail.tsx`:

**Estrutura:**
- Header + Footer padrão
- Skeleton durante loading (imagem, título, descrição)
- Estado de erro: "Projeto não encontrado" + link para `/projects`

**Layout quando encontrado:**
1. Imagem de capa (16:9) se existir
2. Título (`font-display font-semibold text-3xl`)
3. Badges: engine (`secondary`), plataformas (`outline`), gêneros (`outline`) — usando labels de `project-labels.ts`
4. Descrição simples (campo `descricao`, não o `descricao_rich`)
5. Links externos: botões para demo_url, codigo_url, steam_url (se existirem)
6. Rodapé: "Projeto de" + link para `/studio/{estudio.slug}`

**useParams:** `slug` (estúdio, não usado agora) e `projectSlug` (passado ao hook)

### Arquivos afetados
- `src/hooks/useStudioProject.ts` (criar)
- `src/pages/StudioProjectDetail.tsx` (criar)
