

# Melhorias na Pagina de Detalhe da Vaga (/jobs/:slug)

## Verificacao previa

Antes das melhorias, confirmei o estado atual:

1. **Logo do estudio**: OK. O card lateral ja usa Avatar com `logo_url` e fallback com inicial do nome (linha 258-266).
2. **Validacao de visibilidade**: Parcialmente OK. A query filtra `ativa = true` e `expira_em > now()`, mas **NAO filtra `status = 'publicada'`**. Isso sera corrigido.
3. **Pagina 404**: OK. O componente `JobNotFound` ja e exibido quando a vaga nao e encontrada (linha 134-143).

## Correcao: Adicionar filtro de status na query

### Arquivo: `src/hooks/useJobDetail.ts`

Adicionar `.eq("status", "publicada")` a query do Supabase, entre `.eq("ativa", true)` e `.gt("expira_em", now)`. Isso garante que rascunhos e vagas ocultas nao sejam acessiveis pela URL publica.

## Melhoria 1: Texto explicativo de candidatura

### Arquivo: `src/pages/JobDetail.tsx`

No card "Como se candidatar" (linhas 293-318), adicionar um paragrafo explicativo entre o `CardHeader` e o bloco do email:

```
<p className="text-sm text-muted-foreground mb-3">
  Para se candidatar a esta vaga, entre em contato através do email abaixo:
</p>
```

Posicionar dentro do `CardContent`, antes da div com o email e botao de copia.

## Melhoria 2: Card do estudio clicavel

### Arquivo: `src/pages/JobDetail.tsx`

**Mudancas:**
- Importar `ChevronRight` do lucide-react
- Envolver o card do estudio (linhas 255-290) com `<Link to={/studio/${vaga.estudio?.slug}}>` 
- Adicionar classes de hover ao Card: `transition-colors duration-200 hover:bg-accent cursor-pointer`
- Ao lado do nome do estudio, adicionar icone `ChevronRight` com classe `md:hidden` (visivel apenas no mobile)
- O nome do estudio fica em uma div flex com `items-center gap-1` para alinhar o icone

**Estrutura resultante:**
```
<Link to={`/studio/${vaga.estudio?.slug}`} className="block">
  <Card className="transition-colors duration-200 hover:bg-accent cursor-pointer">
    <CardContent className="pt-6">
      <!-- Avatar + Nome com icone mobile -->
      <div>
        <h2 className="font-semibold text-lg flex items-center gap-1">
          {vaga.estudio?.nome}
          <ChevronRight className="w-4 h-4 text-muted-foreground md:hidden" />
        </h2>
      </div>
      <!-- Localizacao, tamanho -->
    </CardContent>
  </Card>
</Link>
```

O Link so sera renderizado se `vaga.estudio?.slug` existir. Caso contrario, manter o card sem link (fallback seguro).

## Resumo das alteracoes

| Arquivo | Mudanca |
|---------|---------|
| `src/hooks/useJobDetail.ts` | Adicionar filtro `.eq("status", "publicada")` |
| `src/pages/JobDetail.tsx` | Texto explicativo no card de candidatura + card do estudio clicavel com hover e icone mobile |

