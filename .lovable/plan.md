

## Adicionar rota /studios ao App.tsx

Duas linhas novas, zero alterações em código existente.

### Linha 1 — Import
Adicionar `import Studios from "./pages/Studios";` no bloco de imports, após o import de `Professionals`.

### Linha 2 — Rota
Adicionar `<Route path="/studios" element={<Studios />} />` imediatamente após a rota `/professionals` (linha ~133 do arquivo atual).

Nenhuma outra alteração.

