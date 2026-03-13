

## Plano: Edge Function de Sitemap dinâmico

### O que será feito

Criar uma única Edge Function que gera um sitemap XML consultando o banco de dados em tempo real, listando todas as URLs públicas (páginas estáticas, vagas, profissionais, estúdios e projetos).

### Arquivos afetados

**1. Criar** `supabase/functions/sitemap/index.ts` — com o conteúdo exato fornecido na task.

**2. Atualizar** `supabase/config.toml` — adicionar entrada para a nova função com `verify_jwt = false` (o sitemap é público, não requer autenticação):

```toml
[functions.sitemap]
verify_jwt = false
```

### Detalhes técnicos

- A função usa `SUPABASE_SERVICE_ROLE_KEY` (já configurada nos secrets) para consultar as tabelas `vagas`, `users`, `estudios` e `projetos` sem restrições de RLS
- Retorna XML com `Cache-Control: public, max-age=3600` (cache de 1 hora)
- Nenhum outro arquivo será alterado

