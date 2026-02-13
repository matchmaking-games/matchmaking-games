

# Reorganizar Rotas Privadas do Estudio: /studio/* para /studio/manage/*

## Resumo

Renomear todas as rotas privadas de gerenciamento do estudio de `/studio/*` para `/studio/manage/*`, liberando `/studio/:slug` para a pagina publica sem conflitos.

## Mapeamento de Rotas

```text
/studio/new             -->  /studio/manage/new
/studio/dashboard       -->  /studio/manage/dashboard
/studio/profile         -->  /studio/manage/profile
/studio/team            -->  /studio/manage/team
/studio/jobs            -->  /studio/manage/jobs
/studio/jobs/new        -->  /studio/manage/jobs/new
/studio/jobs/:id/edit   -->  /studio/manage/jobs/:id/edit
```

## Rotas que NAO mudam

- `/studio/:slug` -- pagina publica (permanece como esta)
- `/studio/${membership.estudio.slug}` -- link para pagina publica no sidebar footer (e uma URL publica, nao rota privada)
- `matchmaking.games/studio/` -- preview de URL no formulario de slug (e texto visual, nao rota)

## Arquivos afetados (10 arquivos, todas as ocorrencias)

### 1. `src/App.tsx` (6 rotas a alterar)

Alterar os paths das rotas:
- `/studio/new` para `/studio/manage/new`
- `/studio/dashboard` para `/studio/manage/dashboard`
- `/studio/profile` para `/studio/manage/profile`
- `/studio/jobs` para `/studio/manage/jobs`
- `/studio/jobs/new` para `/studio/manage/jobs/new`
- `/studio/jobs/:id/edit` para `/studio/manage/jobs/:id/edit`

A rota `/studio/:slug` permanece inalterada.

### 2. `src/components/studio/StudioSidebar.tsx` (4 ocorrencias)

Array `navItems`:
- `"/studio/dashboard"` para `"/studio/manage/dashboard"`
- `"/studio/jobs"` para `"/studio/manage/jobs"`
- `"/studio/profile"` para `"/studio/manage/profile"`
- `"/studio/team"` para `"/studio/manage/team"`

Tambem atualizar a comparacao `end={item.url === "/studio/dashboard"}` para `"/studio/manage/dashboard"`.

NAO alterar: `href={/studio/${membership.estudio.slug}}` (link publico).

### 3. `src/components/dashboard/DashboardSidebar.tsx` (2 ocorrencias)

- Linha 62: `"/studio/dashboard"` para `"/studio/manage/dashboard"` (nav item "Meu estudio")
- Linha 128: `"/studio/new"` para `"/studio/manage/new"` (link "Criar Estudio" no dropdown)

### 4. `src/components/studio/StudioDashboardLayout.tsx` (1 ocorrencia)

- Linha 18: `navigate("/studio/new")` para `navigate("/studio/manage/new")`

### 5. `src/pages/studio/NewStudio.tsx` (2 ocorrencias)

- Linha 95: `navigate("/studio/dashboard")` para `navigate("/studio/manage/dashboard")`
- Linha 203: `navigate("/studio/dashboard")` para `navigate("/studio/manage/dashboard")`

NAO alterar: `matchmaking.games/studio/` (texto visual do preview de URL).

### 6. `src/pages/studio/Profile.tsx` (2 ocorrencias)

- Linha 247: `navigate("/studio/new")` para `navigate("/studio/manage/new")`
- Linha 692: `navigate("/studio/dashboard")` para `navigate("/studio/manage/dashboard")`

NAO alterar: `matchmaking.games/studio/` (texto do preview de URL do slug).

### 7. `src/pages/studio/Jobs.tsx` (4 ocorrencias)

- Linha 119: `navigate('/studio/jobs', ...)` para `navigate('/studio/manage/jobs', ...)`
- Linha 132: `navigate('/studio/jobs', ...)` para `navigate('/studio/manage/jobs', ...)`
- Linha 257: `navigate("/studio/jobs/new")` para `navigate("/studio/manage/jobs/new")`
- Linha 315: `navigate("/studio/jobs/new")` para `navigate("/studio/manage/jobs/new")`

### 8. `src/pages/studio/JobForm.tsx` (4 ocorrencias)

- Linha 169: `navigate("/studio/jobs")` para `navigate("/studio/manage/jobs")`
- Linha 424: `<Navigate to="/studio/jobs" replace />` para `<Navigate to="/studio/manage/jobs" replace />`
- Linha 450: `navigate("/studio/jobs")` para `navigate("/studio/manage/jobs")`
- Linha 1025: `navigate("/studio/jobs")` para `navigate("/studio/manage/jobs")`

### 9. `src/hooks/useJobForm.ts` (4 ocorrencias)

- Linha 324: `navigate("/studio/jobs")` para `navigate("/studio/manage/jobs")`
- Linha 393: `navigate("/studio/jobs")` para `navigate("/studio/manage/jobs")`
- Linha 474: `navigate("/studio/jobs")` para `navigate("/studio/manage/jobs")`
- Linha 619: `navigate("/studio/jobs")` para `navigate("/studio/manage/jobs")`

### 10. `src/components/studio/JobsTable.tsx` (1 ocorrencia)

- Linha 147: `` navigate(`/studio/jobs/${vaga.id}/edit`) `` para `` navigate(`/studio/manage/jobs/${vaga.id}/edit`) ``

### 11. `src/components/studio/JobsMobileCard.tsx` (1 ocorrencia)

- Linha 129: `` navigate(`/studio/jobs/${vaga.id}/edit`) `` para `` navigate(`/studio/manage/jobs/${vaga.id}/edit`) ``

## Total: 31 ocorrencias em 11 arquivos

Nenhuma migracao de banco, nenhuma alteracao de logica. Apenas substituicao de strings de rota.

