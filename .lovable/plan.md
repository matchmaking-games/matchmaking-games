

## Melhorias visuais para eventos encerrados

### Problema identificado
Atualmente o código já possui a lógica `isEncerrado` e um badge "Encerrado", mas:
1. O menu de ações (ellipsis) ainda aparece (mesmo com "Editar" desabilitado)
2. O card tem a mesma cor que eventos ativos
3. Pode confundir usuários tentando editar algo já finalizado

### Solução

Três mudanças no componente `EventCard` (linhas 70-153):

**1. Ocultar menu de ações quando encerrado**
- Envolver o `DropdownMenu` (linhas 96-117) em condicional `{!isEncerrado && ...}`
- Usuário não verá opção de editar evento passado

**2. Card com visual "inativo"**
- Adicionar prop `className` condicional no `<Card>` (linha 82)
- Quando `isEncerrado`: aplicar opacidade reduzida + borda mais suave
- Exemplo: `className={isEncerrado ? "opacity-60 bg-muted/40" : ""}`

**3. Texto do nome em tom neutro**
- Mudar `text-foreground` → `text-muted-foreground` quando encerrado (linha 86)
- Reforça visualmente que o evento já passou

### Resultado esperado
- Eventos ativos: card normal, menu visível
- Eventos encerrados: card com visual desbotado, sem menu de ações, badge "Encerrado" vermelho

