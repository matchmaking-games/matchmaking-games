
# Funcionalidade de Convite de Membros para o Estudio

## Resumo

Adicionar um Dialog de convite de novos membros na pagina `/studio/manage/team`. O super admin informa email e permissao, e o sistema cria um registro na tabela `estudio_convites`. Sem envio de email (MVP).

## Arquivos a modificar/criar

### 1. Modificar `src/hooks/useStudioMembers.ts`

Expor `estudioId` no retorno do hook para que o componente de convite possa usa-lo.

- Adicionar `estudioId: string | null` na interface `UseStudioMembersReturn`
- Adicionar `estudioId` no objeto de retorno (linha 201)

### 2. Criar `src/components/studio/InviteMemberDialog.tsx`

Componente Dialog controlado com formulario de convite.

**Props:**
```text
open: boolean
onOpenChange: (open: boolean) => void
estudioId: string
currentUserId: string
onSuccess: () => void
```

**Estado interno (useState):**
- `email: string` (campo de input)
- `role: UserRole` (select, default "member")
- `isSubmitting: boolean`
- `emailError: string | null` (erro de validacao inline)

**Validacao no submit (sem Zod externo, validacao manual simples):**
1. Validar email com regex basico ou `z.string().email()` do Zod (ja esta no projeto)
2. Buscar na tabela `users` se existe usuario com esse email
3. Se existir, verificar na tabela `estudio_membros` se ja e membro ativo do estudio
4. Se ja for membro, setar `emailError` com "Este email ja e membro do estudio"
5. Verificar tambem se ja existe convite pendente (nao aceito e nao expirado) para evitar duplicatas

**Insert no banco:**
```text
supabase.from("estudio_convites").insert({
  estudio_id: estudioId,
  email_convidado: email.trim().toLowerCase(),
  role: role,
  convidado_por: currentUserId,
})
```

**UI do Dialog:**
- Titulo: "Convidar Novo Membro"
- Descricao: "Um convite sera criado e ficara valido por 7 dias."
- Campo Email: Input type="email" com placeholder "exemplo@email.com", Label com asterisco
- Campo Permissao: Select com "Membro" (default) e "Super Admin"
- Footer: Botao "Cancelar" (outline) + Botao "Enviar Convite" (primary)
- Loading state no botao durante submit
- Limpar form ao fechar/abrir

### 3. Modificar `src/pages/studio/Team.tsx`

Adicionar botao "Convidar Membro" e o Dialog.

**Mudancas:**
- Importar `UserPlus` do lucide-react
- Importar `InviteMemberDialog`
- Adicionar estado `inviteDialogOpen`
- Extrair `estudioId` do hook (apos modificacao)
- No header da pagina, ao lado do titulo, adicionar botao:
  ```text
  <Button onClick={() => setInviteDialogOpen(true)}>
    <UserPlus className="mr-2 h-4 w-4" />
    Convidar Membro
  </Button>
  ```
  Visivel apenas quando `isAuthorized && !isLoading`
- Renderizar `InviteMemberDialog` passando `estudioId`, `currentUserId` e `refetch` como `onSuccess`

## Detalhes de implementacao

**Verificacao de email duplicado (2 queries sequenciais):**
1. Buscar usuario pelo email na tabela `users` com `.maybeSingle()`
2. Se encontrar, verificar em `estudio_membros` se `user_id` + `estudio_id` + `ativo = true`
3. Se ja for membro, mostrar erro

**Verificacao de convite pendente:**
- Buscar em `estudio_convites` por `email_convidado` + `estudio_id` + `aceito = false`
- Se existir convite nao expirado, mostrar erro "Ja existe um convite pendente para este email"

**Reset do form:** Ao abrir o dialog (onOpenChange para true) ou ao fechar, limpar email, role para "member", e emailError

**Toast de sucesso:** Usar `useToast` com titulo "Convite enviado" e descricao "Convite enviado para [email]!"

## O que NAO muda

- Nao envia email (MVP)
- Nao mostra lista de convites pendentes (pode ser feature futura)
- Nao cria pagina de aceitar convite (task 513)
- Nao gera token manualmente (banco faz via DEFAULT)
