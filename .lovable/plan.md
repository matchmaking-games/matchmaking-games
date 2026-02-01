

## Plano Atualizado: Pagina de Edicao do Perfil do Estudio

### Resumo

Criar a pagina `/studio/profile` com formulario completo para edicao dos dados publicos do estudio, com header DENTRO do Card e componente de especialidades com funcionalidade completa de tags.

---

### Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/pages/studio/Profile.tsx` | Pagina principal de edicao do perfil do estudio |
| `src/components/studio/SpecialtiesInput.tsx` | Componente de input de tags para especialidades |

### Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/App.tsx` | Adicionar rota `/studio/profile` com ProtectedRoute |

---

### Secao Tecnica

#### 1. Estrutura da Pagina - Header DENTRO do Card

Seguindo o padrao de `NewStudio.tsx`, o header fica antes do Card:

```typescript
return (
  <StudioDashboardLayout>
    <div className="w-full max-w-4xl mx-auto">
      {/* Form Card (TUDO dentro do Card) */}
      <Card>
        <CardContent className="pt-6">
          {/* Header DENTRO do Card */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground">
              Perfil do Estudio
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie as informacoes publicas do seu estudio
            </p>
          </div>

          {/* Todo o formulario aqui dentro */}
        </CardContent>
      </Card>
    </div>
  </StudioDashboardLayout>
);

```

---

#### 2. Componente SpecialtiesInput - Implementacao Completa

```typescript
// src/components/studio/SpecialtiesInput.tsx
import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SpecialtiesInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

const SUGGESTIONS = [
  "Mobile", "PC", "Console", "VR", "Casual", 
  "Indie", "AA", "AAA", "F2P"
];

export function SpecialtiesInput({ 
  value, 
  onChange, 
  disabled 
}: SpecialtiesInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    // Nao adicionar vazio ou duplicado
    if (!trimmed || value.includes(trimmed)) return;
    
    onChange([...value, trimmed]);
    setInputValue("");
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Enter ou virgula adiciona a tag
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  // Sugestoes nao adicionadas ainda
  const availableSuggestions = SUGGESTIONS.filter(
    s => !value.includes(s)
  );

  return (
    <div className="space-y-3">
      {/* Tags adicionadas */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className="text-sm py-1 px-3"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                disabled={disabled}
                className="ml-2 hover:text-destructive focus:outline-none disabled:opacity-50"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input para adicionar nova tag */}
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Adicionar especialidade (ex: Mobile, PC, Console)"
        disabled={disabled}
        className="h-11"
      />
      
      <p className="text-xs text-muted-foreground">
        Pressione Enter ou virgula para adicionar
      </p>

      {/* Sugestoes clicaveis */}
      {availableSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground mr-1">
            Sugestoes:
          </span>
          {availableSuggestions.map((suggestion) => (
            <Button
              key={suggestion}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addTag(suggestion)}
              disabled={disabled}
              className="h-7 text-xs"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

#### 3. Schema de Validacao Zod

```typescript
const studioProfileSchema = z.object({
  nome: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  descricao: z.string()
    .max(500, "Maximo 500 caracteres")
    .optional()
    .or(z.literal("")),
  sobre: z.string()
    .max(5000, "Maximo 5000 caracteres")
    .optional()
    .or(z.literal("")),
  localizacao: z.string()
    .max(100, "Maximo 100 caracteres")
    .optional()
    .or(z.literal("")),
  tamanho: z.enum(["micro", "pequeno", "medio", "grande"])
    .nullable()
    .optional(),
  website: z.string()
    .url("URL invalida")
    .optional()
    .or(z.literal("")),
  especialidades: z.array(z.string()).optional(),
  fundado_em: z.string()
    .optional()
    .or(z.literal("")),
});
```

---

#### 4. Estrutura Visual Atualizada
```text
+----------------------------------------------------------+
| [StudioDashboardLayout com Sidebar]                       |
+----------------------------------------------------------+
| [Area de Conteudo]                                        |
|                                                           |
|   +-----------------------------------------------------+ |
|   | [Card]                                              | |
|   |                                                     | |
|   |   Perfil do Estudio           <- H1 DENTRO do Card  | |
|   |   Gerencie as informacoes...  <- P DENTRO do Card   | |
|   |                                                     | |
|   |   [Logo circular 96px] [Alterar foto]               | |
|   |                                                     | |
|   |   Nome do estudio *                                 | |
|   |   [__________________________________]              | |
|   |                                                     | |
|   |   URL publica                                       | |
|   |   [matchmaking.games/studio/slug (disabled)]        | |
|   |                                                     | |
|   |   Localizacao                                       | |
|   |   [__________________________________]              | |
|   |                                                     | |
|   |   Tamanho do estudio                                | |
|   |   [Select: Micro/Pequeno/Medio/Grande]              | |
|   |                                                     | |
|   |   ─────────────────────────────────────             | |
|   |                                                     | |
|   |   Descricao curta                          150/500  | |
|   |   [Textarea 3 linhas___________________]            | |
|   |                                                     | |
|   |   Sobre                                 1200/5000   | |
|   |   [Textarea 8-10 linhas________________]            | |
|   |                                                     | |
|   |   ─────────────────────────────────────             | |
|   |                                                     | |
|   |   Website                                           | |
|   |   [https://______________________________]          | |
|   |                                                     | |
|   |   Especialidades                                    | |
|   |   [Mobile x] [PC x] [Indie x]   <- Badges com X     | |
|   |   [_______________________________]  <- Input       | |
|   |   Pressione Enter ou virgula para adicionar         | |
|   |   Sugestoes: [Console] [VR] [Casual] <- Clicaveis   | |
|   |                                                     | |
|   |   ─────────────────────────────────────             | |
|   |                                                     | |
|   |   Data de fundacao                                  | |
|   |   [Date picker_________________________]            | |
|   |                                                     | |
|   |   ─────────────────────────────────────             | |
|   |                                                     | |
|   |   [Cancelar]               [Salvar Alteracoes]      | |
|   |                                                     | |
|   +-----------------------------------------------------+ |
|                                                           |
+----------------------------------------------------------+
```

---

#### 5. Secoes do Formulario com Separadores Visuais

O formulario sera organizado em secoes com separadores (`<Separator />` ou `<hr>`):

1. **Informacoes Basicas**
   - Logo upload
   - Nome
   - URL publica (disabled)
   - Localizacao
   - Tamanho

2. **Sobre** (apos separador)
   - Descricao curta (textarea 500 chars)
   - Sobre (textarea 5000 chars)

3. **Links** (apos separador)
   - Website
   - Especialidades (tags)

4. **Fundacao** (apos separador)
   - Data de fundacao

5. **Acoes** (apos separador)
   - Botao Cancelar
   - Botao Salvar Alteracoes

---

#### 6. Upload de Logo

Reutilizar o componente existente `StudioLogoUpload` (similar ao que ja existe) ou criar um inline:

```typescript
// Upload de logo no formulario
const handleLogoUpload = async (file: File) => {
  // Validar tipo (JPG, PNG, WebP)
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    toast({
      title: "Formato invalido",
      description: "Use apenas JPG, PNG ou WebP",
      variant: "destructive",
    });
    return;
  }

  // Validar tamanho (max 3MB)
  if (file.size > 3 * 1024 * 1024) {
    toast({
      title: "Arquivo muito grande",
      description: "Maximo 3MB permitido",
      variant: "destructive",
    });
    return;
  }

  setIsUploadingLogo(true);

  const extension = file.type.split("/")[1];
  const filePath = `${estudioId}/${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("studio-logos")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    toast({
      title: "Erro no upload",
      variant: "destructive",
    });
    setIsUploadingLogo(false);
    return;
  }

  const { data: urlData } = supabase.storage
    .from("studio-logos")
    .getPublicUrl(filePath);

  // Adicionar cache-busting
  const newLogoUrl = `${urlData.publicUrl}?t=${Date.now()}`;
  setLogoUrl(newLogoUrl);
  setIsUploadingLogo(false);
};
```

---

#### 7. Salvar no Supabase

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setValidationErrors({});

  // Validar com Zod
  const formData = {
    nome,
    descricao,
    sobre,
    localizacao,
    tamanho: tamanho || null,
    website,
    especialidades,
    fundado_em: fundadoEm,
  };

  const result = studioProfileSchema.safeParse(formData);

  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.errors.forEach((err) => {
      if (err.path[0]) {
        errors[err.path[0] as string] = err.message;
      }
    });
    setValidationErrors(errors);
    return;
  }

  setIsSaving(true);

  const { error } = await supabase
    .from("estudios")
    .update({
      nome,
      descricao: descricao || null,
      sobre: sobre || null,
      localizacao: localizacao || null,
      tamanho: tamanho || null,
      website: website || null,
      especialidades: especialidades.length > 0 ? especialidades : null,
      fundado_em: fundadoEm || null,
      logo_url: logoUrl,
      atualizado_em: new Date().toISOString(),
    })
    .eq("id", membership.estudio.id);

  setIsSaving(false);

  if (error) {
    toast({
      title: "Erro ao salvar",
      description: "Tente novamente mais tarde.",
      variant: "destructive",
    });
    return;
  }

  toast({
    title: "Perfil atualizado!",
    description: "As alteracoes foram salvas com sucesso.",
  });
};
```

---

#### 8. Atualizar App.tsx

```typescript
import StudioProfile from "./pages/studio/Profile";

// Dentro de <Routes>:
<Route
  path="/studio/profile"
  element={
    <ProtectedRoute>
      <StudioProfile />
    </ProtectedRoute>
  }
/>
```

---

### Estados da Aplicacao

| Estado | Comportamento |
|--------|---------------|
| Carregando dados | Loader2 centralizado enquanto busca dados |
| Upload de logo | Overlay com Loader2 sobre o avatar |
| Salvando | Botao desabilitado com "Salvando..." e spinner |
| Sucesso | Toast "Perfil atualizado com sucesso!" |
| Erro | Toast com mensagem de erro |

---

### Resumo das Correcoes Aplicadas

| Correcao | Status |
|----------|--------|
| Header DENTRO do Card | Aplicado - seguindo padrao de NewStudio.tsx |
| SpecialtiesInput com Enter/virgula | Aplicado - implementacao completa |
| Badges com botao X para remover | Aplicado |
| Sugestoes clicaveis | Aplicado - 9 sugestoes predefinidas |

---

### O que NAO sera implementado

- Funcionalidade de alterar slug (slug e permanente)
- Historico de mudancas
- Preview da pagina publica
- Upload de multiplas imagens

