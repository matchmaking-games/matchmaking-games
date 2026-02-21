

## Plano de Implementacao - TASK-806 + TASK-807

### Resumo

Reorganizar o cabecalho da pagina de perfil para layout de duas colunas (avatar a esquerda, nome + slug + importacao a direita) e criar o fluxo de importacao de curriculo do LinkedIn com modal de confirmacao.

---

### 1. Criar `src/components/ImportConfirmModal.tsx`

Modal usando AlertDialog do shadcn/ui.

**Props:**
- `open: boolean`
- `onClose: () => void`
- `onConfirm: (file: File) => void`
- `pdfFile: File | null`

**Conteudo:**
- Titulo com icone AlertTriangle: "Atencao: seus dados serao substituidos"
- Bloco de alerta (bg vermelho suave + borda): lista o que sera substituido (experiencias, formacao, skills)
- Bloco positivo (bg verde suave + borda): lista o que sera preservado (bio, projetos, config)
- Observacao em texto menor sobre backup automatico
- Checkbox obrigatorio: "Entendo que minhas experiencias, formacoes e skills serao substituidas"
- Botoes: "Cancelar" (outline) + "Confirmar importacao" (destructive ou default, desabilitado ate checkbox marcado)
- Ao fechar por qualquer motivo, resetar checkbox para false

---

### 2. Criar `src/components/ImportSection.tsx`

Componente que exibe o botao de importacao e o link de historico.

**Props:**
- `onFileSelected: (file: File) => void` -- chamado quando PDF valido e selecionado

**Logica interna:**
- Usa `useImportLimit()` para obter `remainingImports`, `canImport`, `isLoading`
- Input file oculto (accept=".pdf", ref)
- Ao selecionar arquivo: valida tipo (PDF) e tamanho (max 10MB), mostra toast de erro se invalido, chama `onFileSelected` se valido
- Botao "Importar do LinkedIn" com icone Upload, desabilitado quando `!canImport`
- Texto discreto "Ver historico . X/3 importacoes este mes" ou "Limite mensal atingido . 0/3 importacoes restantes" (cor de aviso) quando `!canImport`
- Skeleton enquanto `isLoading`

---

### 3. Reorganizar cabecalho em `src/pages/Profile.tsx`

**Alteracao na area do avatar (linhas 317-325):**

Substituir o bloco centralizado atual por um layout de duas colunas:

```text
Desktop (md+):
+------------------+--------------------------------+
| Avatar           | Nome completo (text-2xl bold)   |
| [Alterar foto]   | matchmaking.games/slug (muted) |
|                  | [ImportSection]                |
+------------------+--------------------------------+

Mobile (<md):
+--------------------------------+
|         Avatar (center)        |
|       [Alterar foto]           |
|    Nome completo (center)      |
|    matchmaking.games/slug      |
|      [ImportSection]           |
+--------------------------------+
```

**Classes Tailwind:**
- Container: `flex flex-col items-center md:flex-row md:items-start gap-6 pb-6 border-b border-border`
- Coluna esquerda (avatar): `flex flex-col items-center md:items-start` -- reutiliza AvatarUpload existente ajustando alinhamento
- Coluna direita: `flex flex-col items-center md:items-start gap-2 flex-1`

**Novos estados em Profile.tsx:**
- `selectedPdfFile: File | null` (useState)
- `isImportModalOpen: boolean` (useState)

**Fluxo:**
1. ImportSection chama `onFileSelected(file)` -> seta `selectedPdfFile` e `isImportModalOpen = true`
2. Modal confirma -> fecha modal, limpa arquivo, mostra toast "Arquivo recebido! Em breve voce vera a tela de revisao."
3. Modal cancela -> fecha modal, limpa arquivo

**Imports adicionados:** ImportSection, ImportConfirmModal, useImportLimit (nao -- usado internamente pelo ImportSection)

---

### 4. Ajuste no AvatarUpload

Remover o `mb-8` do wrapper e a centralizacao interna (`items-center`) para que o componente pai controle o alinhamento. O AvatarUpload mantem toda sua logica de upload intacta -- apenas o CSS externo do container muda.

---

### Arquivos tocados

| Arquivo | Acao |
|---|---|
| `src/components/ImportSection.tsx` | Criar |
| `src/components/ImportConfirmModal.tsx` | Criar |
| `src/pages/Profile.tsx` | Editar cabecalho, adicionar estados do modal |
| `src/components/dashboard/AvatarUpload.tsx` | Remover `mb-8` do wrapper para layout flexivel |

### O que NAO muda

- Formularios de edicao abaixo do cabecalho
- Abas de navegacao (ProfileNavigation)
- Logica de salvar perfil
- Hook useImportLimit
- Autenticacao

