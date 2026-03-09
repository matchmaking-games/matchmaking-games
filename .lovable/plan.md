

## Plano: Adicionar "Ver evento" no dropdown

### Mudanças

**`src/pages/dashboard/Events.tsx`**
- Importar `ExternalLink` do lucide-react
- Adicionar item "Ver evento" no `DropdownMenuContent`, antes de "Editar"
- Ao clicar: `window.open("/eventos?id=" + evento.id, "_blank")`

Eventos encerrados permanecem sem alteração (sem dropdown, visual inativo).

