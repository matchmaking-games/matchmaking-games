

## TASK-902: Criar schema.ts e YouTubeBlock.tsx

Criacao de dois arquivos novos no diretorio `src/components/editor/`. Nenhum arquivo existente sera alterado.

---

### Arquivos a criar

**1. `src/components/editor/schema.ts`**

Schema customizado do BlockNote que define os blocos permitidos no editor. Inclui os blocos padrao (paragraph, heading, listas, code, quote, image) mais o bloco customizado `youtube`. O bloco `table` esta intencionalmente excluido.

**2. `src/components/editor/YouTubeBlock.tsx`**

Bloco customizado criado com `createReactBlockSpec` do BlockNote. Comportamento:
- Quando `url` esta vazia: renderiza um input de texto com label "Cole a URL do YouTube"
- Quando a URL e valida (youtube.com/watch?v= ou youtu.be/): renderiza um iframe 16:9 com o video incorporado
- A funcao `getEmbedUrl` extrai o video ID de ambos os formatos de URL do YouTube

### Detalhes tecnicos

- O YouTubeBlock usa `createReactBlockSpec` (de `@blocknote/react`, ja instalado na TASK-900)
- O schema usa `BlockNoteSchema.create` e `defaultBlockSpecs` de `@blocknote/core`
- O JSX do render do YouTubeBlock usa classes Tailwind para estilizacao do input e do container do iframe
- O tipo `EditorSchema` e exportado para uso futuro em outros componentes

### O que NAO muda

- Nenhum arquivo existente
- Nenhum componente, hook, pagina ou configuracao

