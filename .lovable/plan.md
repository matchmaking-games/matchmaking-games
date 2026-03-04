

# Instalar e Configurar Sentry

## Questao sobre as variaveis de ambiente

As DSNs do Sentry sao chaves publicas (ficam expostas no JavaScript do cliente em qualquer app que use Sentry). Como o Lovable nao suporta arquivos `.env` e os secrets do Supabase so funcionam em edge functions (nao no frontend), a abordagem correta e determinar a DSN no codigo com base em `import.meta.env.MODE`:

```ts
const dsn = import.meta.env.MODE === "production"
  ? "https://fa8a7b09738d...@...sentry.io/4510984306688000"
  : "https://e51266dd8e06...@...sentry.io/4510984328577024";
```

Isso e seguro porque DSNs do Sentry sao projetadas para serem publicas.

---

## Alteracoes

### 1. Instalar `@sentry/react`

Adicionar ao package.json.

### 2. Criar `src/instrument.ts`

- Importa `* as Sentry` de `@sentry/react`
- Seleciona a DSN com base em `import.meta.env.MODE`
- Chama `Sentry.init()` com: dsn, environment (`import.meta.env.MODE`), sendDefaultPii false, integrations com apenas `browserTracingIntegration()`, tracesSampleRate 1.0, tracePropagationTargets `["localhost"]`

### 3. Modificar `src/main.tsx`

Adicionar `import "./instrument"` como primeira linha, antes de todos os outros imports. Resto do arquivo inalterado.

### 4. Modificar `src/App.tsx`

- Importar `* as Sentry` de `@sentry/react`
- Envolver todo o conteudo do `AuthProvider` com `<Sentry.ErrorBoundary fallback={...}>` usando a mensagem "Algo deu errado. Por favor, recarregue a pagina."
- Nenhuma outra alteracao no arquivo

### Nenhum outro arquivo alterado

