

# Upload de Imagens no Editor BlockNote

## Arquivos a criar
- `src/hooks/useProjectImageUpload.ts`

## Arquivos a modificar
- `src/components/editor/RichTextEditor.tsx` (3 linhas)

## Dependencia a instalar
- `browser-image-compression`

---

## Passo 1 -- Instalar browser-image-compression

Adicionar `browser-image-compression` ao package.json.

---

## Passo 2 -- Criar `src/hooks/useProjectImageUpload.ts`

Hook que exporta `{ uploadFile }` onde `uploadFile` recebe um `File` e retorna `Promise<string>`.

Fluxo interno:
1. Validar tipo: aceitar apenas `image/jpeg`, `image/png`, `image/webp`. Erro: "Tipo de arquivo não permitido. Use JPG, PNG ou WebP."
2. Comprimir com `browser-image-compression`: `maxSizeMB: 3`, `maxWidthOrHeight: 2560`, `useWebWorker: true`, `initialQuality: 0.85`
3. Obter user via `supabase.auth.getUser()`. Se nao autenticado, erro: "Usuário não autenticado."
4. Gerar path: `{userId}/{Date.now()}.{extensao}`
5. Upload para bucket `project-images` com `upsert: false`
6. Retornar URL publica via `getPublicUrl`

---

## Passo 3 -- Modificar `RichTextEditor.tsx`

Tres mudancas cirurgicas:

1. **Linha 24** (imports): adicionar `import { useProjectImageUpload } from "@/hooks/useProjectImageUpload";`

2. **Linha 102** (antes do `useCreateBlockNote`): adicionar `const { uploadFile } = useProjectImageUpload();`

3. **Linha 103-104** (dentro do `useCreateBlockNote`): adicionar `uploadFile,` apos `initialContent: parsedContent,`

Nenhuma outra alteracao no arquivo. O BlockNote detecta automaticamente a presenca de `uploadFile` e habilita o botao de upload no bloco de imagem.

---

## O que NAO muda
- `schema.ts`, `YouTubeBlock.tsx`, `RichTextViewer.tsx`
- Nenhuma pagina, rota ou hook existente
- Nenhum comportamento atual do editor
