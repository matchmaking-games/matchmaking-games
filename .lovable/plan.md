

## Plano Atualizado: Pagina de Criacao de Estudio (/studio/new)

### Visao Geral

Criar a pagina `/studio/new` com formulario completo para criacao de estudio. O formulario inclui nome, slug (URL personalizada), localizacao e tamanho do estudio. Apos a criacao, o usuario e redirecionado para `/studio/dashboard`.

---

### Correcoes Incorporadas

| Correcao | Tipo | Detalhes |
|----------|------|----------|
| GRANT EXECUTE na funcao SQL | Obrigatorio | Adicionar permissoes para authenticated e anon |
| Verificar DashboardLayout | Obrigatorio | Confirmado que existe - manter uso do componente |
| Check de estudio existente | Recomendado | Redirecionar se usuario ja tem estudio |
| Classe lowercase no input | Recomendado | Adicionar classe `lowercase` no input de slug |

---

### Arquivos a Criar/Modificar

| Acao | Arquivo | Descricao |
|------|---------|-----------|
| Criar | Migration SQL | Criar funcao RPC check_studio_slug_availability com GRANT |
| Criar | `src/hooks/useCheckStudioSlug.ts` | Hook para verificar disponibilidade do slug |
| Criar | `src/pages/studio/NewStudio.tsx` | Pagina principal do formulario |
| Modificar | `src/App.tsx` | Adicionar rota /studio/new protegida |

---

### Secao Tecnica

#### 1. Funcao RPC para verificar slug de estudio (COM GRANT)

```sql
CREATE OR REPLACE FUNCTION check_studio_slug_availability(slug_to_check text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM estudios WHERE slug = lower(slug_to_check)
  );
END;
$$;

-- Permissoes para usuarios autenticados e anonimos
GRANT EXECUTE ON FUNCTION check_studio_slug_availability(text) TO authenticated;
GRANT EXECUTE ON FUNCTION check_studio_slug_availability(text) TO anon;
```

---

#### 2. Hook useCheckStudioSlug.ts

Hook para verificar disponibilidade do slug do estudio com debounce:

```typescript
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "./useDebounce";

interface SlugCheckResult {
  isChecking: boolean;
  isAvailable: boolean | null;
  error: string | null;
}

export function useCheckStudioSlug(slug: string, isValid: boolean): SlugCheckResult {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const debouncedSlug = useDebounce(slug, 500);

  useEffect(() => {
    // Nao verificar se slug vazio ou invalido
    if (!debouncedSlug || !isValid) {
      setIsAvailable(null);
      setIsChecking(false);
      return;
    }

    const checkAvailability = async () => {
      setIsChecking(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc(
        "check_studio_slug_availability",
        { slug_to_check: debouncedSlug }
      );

      if (rpcError) {
        console.error("Error checking studio slug:", rpcError);
        setError("Erro ao verificar disponibilidade");
        setIsAvailable(false);
      } else {
        setIsAvailable(data);
      }

      setIsChecking(false);
    };

    checkAvailability();
  }, [debouncedSlug, isValid]);

  return { isChecking, isAvailable, error };
}
```

---

#### 3. Pagina NewStudio.tsx

**Imports:**

```typescript
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { ChevronLeft, Check, X, Loader2, Building2, MapPin } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCheckStudioSlug } from "@/hooks/useCheckStudioSlug";
```

**Schema Zod:**

```typescript
const createStudioSchema = z.object({
  nome: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  slug: z.string()
    .min(3, "Slug deve ter pelo menos 3 caracteres")
    .max(50, "Slug muito longo")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minusculas, numeros e hifen")
    .refine(slug => !slug.startsWith('-') && !slug.endsWith('-'),
      "Slug nao pode comecar ou terminar com hifen"),
  localizacao: z.string()
    .min(1, "Localizacao e obrigatoria")
    .max(100, "Localizacao muito longa"),
  tamanho: z.enum(['micro', 'pequeno', 'medio', 'grande'], {
    errorMap: () => ({ message: "Selecione o tamanho do estudio" })
  }),
});

type CreateStudioForm = z.infer<typeof createStudioSchema>;
```

**Funcao de geracao de slug:**

```typescript
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]+/g, '-')     // Substitui espacos e especiais por hifen
    .replace(/^-+|-+$/g, '')         // Remove hifens do inicio/fim
    .substring(0, 50);               // Limita a 50 caracteres
}
```

**Estados do componente (COM verificacao de estudio existente):**

```typescript
export default function NewStudio() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Form states
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [localizacao, setLocalizacao] = useState("");
  const [tamanho, setTamanho] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Verificar validade do slug para o hook
  const slugValidation = createStudioSchema.shape.slug.safeParse(slug);
  const isSlugFormatValid = slugValidation.success;

  // Hook de verificacao de disponibilidade
  const { isChecking, isAvailable, error: slugError } = useCheckStudioSlug(slug, isSlugFormatValid);

  // MELHORIA 1: Verificar se usuario ja tem estudio
  useEffect(() => {
    const checkExistingStudio = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: existingStudio } = await supabase
        .from("estudios")
        .select("id")
        .eq("criado_por", session.user.id)
        .maybeSingle();

      if (existingStudio) {
        toast({
          title: "Voce ja tem um estudio",
          description: "Redirecionando para o dashboard...",
        });
        navigate("/studio/dashboard");
      }
    };

    checkExistingStudio();
  }, [navigate, toast]);

  // Quando o nome muda, gerar slug automaticamente (se usuario nao editou manualmente)
  useEffect(() => {
    if (!slugTouched && nome) {
      setSlug(generateSlug(nome));
    }
  }, [nome, slugTouched]);

  // Handler para quando usuario edita o slug manualmente
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(value);
    setSlugTouched(true);
  };

  // ... resto dos handlers
}
```

**Funcao de submit:**

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setValidationErrors({});

  // Validar com Zod
  const formData = { nome, slug, localizacao, tamanho };
  const result = createStudioSchema.safeParse(formData);

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

  // Verificar se slug esta disponivel
  if (!isAvailable) {
    setValidationErrors({ slug: "Este slug nao esta disponivel" });
    return;
  }

  setIsSubmitting(true);

  // Buscar ID do usuario
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    toast({
      title: "Erro",
      description: "Sessao expirada. Faca login novamente.",
      variant: "destructive",
    });
    navigate("/login");
    return;
  }

  // Inserir estudio
  const { error: insertError } = await supabase
    .from("estudios")
    .insert({
      nome: nome,
      slug: slug,
      localizacao: localizacao,
      tamanho: tamanho as "micro" | "pequeno" | "medio" | "grande",
      criado_por: session.user.id,
    });

  setIsSubmitting(false);

  if (insertError) {
    console.error("Error creating studio:", insertError);

    // Verificar se e erro de slug duplicado
    if (insertError.code === "23505") {
      setValidationErrors({ slug: "Este slug ja foi registrado. Tente outro." });
      return;
    }

    toast({
      title: "Erro",
      description: "Erro ao criar estudio. Tente novamente.",
      variant: "destructive",
    });
    return;
  }

  // Sucesso!
  toast({
    title: "Estudio criado!",
    description: "Seu estudio foi criado com sucesso.",
  });

  // Invalidar query has-studio para atualizar menu
  queryClient.invalidateQueries({ queryKey: ["has-studio"] });

  // Redirecionar para dashboard do estudio
  navigate("/studio/dashboard");
};
```

**Render do status do slug:**

```typescript
const renderSlugStatus = () => {
  if (!slug || slug.length < 3) return null;

  if (!isSlugFormatValid) {
    return <X className="w-4 h-4 text-destructive" />;
  }

  if (isChecking) {
    return <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />;
  }

  if (isAvailable === true) {
    return <Check className="w-4 h-4 text-primary" />;
  }

  if (isAvailable === false) {
    return <X className="w-4 h-4 text-destructive" />;
  }

  return null;
};
```

**Render do formulario (COM classe lowercase no input de slug):**

```tsx
const isButtonDisabled =
  isSubmitting ||
  !nome ||
  !slug ||
  !localizacao ||
  !tamanho ||
  !isSlugFormatValid ||
  isChecking ||
  isAvailable !== true;

return (
  <DashboardLayout>
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/dashboard">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar
          </Link>
        </Button>

        <h1 className="font-display text-3xl font-bold text-foreground">
          Criar Estudio
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure a pagina do seu estudio para comecar a publicar vagas
        </p>
      </div>

      {/* Form Card */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome do Estudio */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do estudio *</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Kokku Games"
                  className="pl-10 h-11"
                  maxLength={100}
                  disabled={isSubmitting}
                />
              </div>
              {validationErrors.nome && (
                <p className="text-sm text-destructive">{validationErrors.nome}</p>
              )}
            </div>

            {/* Slug (URL) - COM classe lowercase */}
            <div className="space-y-2">
              <Label htmlFor="slug">URL do estudio *</Label>
              <div className="flex items-center bg-input border border-border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all">
                <span className="pl-3 pr-2 text-muted-foreground text-sm whitespace-nowrap">
                  matchmaking.games/studio/
                </span>
                <Input
                  id="slug"
                  value={slug}
                  onChange={handleSlugChange}
                  placeholder="seu-estudio"
                  maxLength={50}
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-11 lowercase"
                  disabled={isSubmitting}
                />
                <div className="px-3">{renderSlugStatus()}</div>
              </div>
              <p className="text-xs text-muted-foreground">
                Este sera o endereco publico do seu estudio
              </p>
              {validationErrors.slug && (
                <p className="text-sm text-destructive">{validationErrors.slug}</p>
              )}
              {!validationErrors.slug && isSlugFormatValid && isAvailable === false && (
                <p className="text-sm text-destructive">Este slug ja esta em uso</p>
              )}
              {!validationErrors.slug && isSlugFormatValid && isAvailable === true && (
                <p className="text-sm text-primary">Slug disponivel!</p>
              )}
            </div>

            {/* Localizacao */}
            <div className="space-y-2">
              <Label htmlFor="localizacao">Localizacao *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="localizacao"
                  value={localizacao}
                  onChange={(e) => setLocalizacao(e.target.value)}
                  placeholder="Ex: Sao Paulo, SP"
                  className="pl-10 h-11"
                  maxLength={100}
                  disabled={isSubmitting}
                />
              </div>
              {validationErrors.localizacao && (
                <p className="text-sm text-destructive">{validationErrors.localizacao}</p>
              )}
            </div>

            {/* Tamanho do Estudio */}
            <div className="space-y-3">
              <Label>Tamanho do estudio *</Label>
              <RadioGroup
                value={tamanho}
                onValueChange={setTamanho}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                disabled={isSubmitting}
              >
                <div className="flex items-center space-x-3 rounded-md border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="micro" id="micro" />
                  <Label htmlFor="micro" className="cursor-pointer font-normal">
                    <span className="font-medium">Micro</span>
                    <span className="text-muted-foreground ml-1">(1-10 funcionarios)</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 rounded-md border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="pequeno" id="pequeno" />
                  <Label htmlFor="pequeno" className="cursor-pointer font-normal">
                    <span className="font-medium">Pequeno</span>
                    <span className="text-muted-foreground ml-1">(11-50 funcionarios)</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 rounded-md border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="medio" id="medio" />
                  <Label htmlFor="medio" className="cursor-pointer font-normal">
                    <span className="font-medium">Medio</span>
                    <span className="text-muted-foreground ml-1">(51-200 funcionarios)</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 rounded-md border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="grande" id="grande" />
                  <Label htmlFor="grande" className="cursor-pointer font-normal">
                    <span className="font-medium">Grande</span>
                    <span className="text-muted-foreground ml-1">(200+ funcionarios)</span>
                  </Label>
                </div>
              </RadioGroup>
              {validationErrors.tamanho && (
                <p className="text-sm text-destructive">{validationErrors.tamanho}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isButtonDisabled}
              className="w-full h-12 text-base font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando estudio...
                </>
              ) : (
                "Criar Estudio"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  </DashboardLayout>
);
```

---

#### 4. Rota no App.tsx

Adicionar rota protegida:

```tsx
import NewStudio from "./pages/studio/NewStudio";

// Adicionar antes da rota catch-all "*":
<Route
  path="/studio/new"
  element={
    <ProtectedRoute>
      <NewStudio />
    </ProtectedRoute>
  }
/>
```

---

### Ordem de Implementacao

| Ordem | Arquivo | Complexidade |
|-------|---------|--------------|
| 1 | Migration SQL (RPC function com GRANT) | Baixa |
| 2 | `src/hooks/useCheckStudioSlug.ts` | Baixa |
| 3 | `src/pages/studio/NewStudio.tsx` | Alta |
| 4 | `src/App.tsx` | Baixa |

---

### Checklist de Validacoes

| Item | Implementacao |
|------|---------------|
| GRANT EXECUTE na funcao SQL | authenticated e anon |
| DashboardLayout confirmado | Componente existe e sera usado |
| Verificar estudio existente | useEffect no mount redireciona se ja tem |
| Classe lowercase no input | className="... lowercase" |
| Nome minimo 2 caracteres | Zod schema |
| Nome maximo 100 caracteres | Zod schema + maxLength |
| Slug minimo 3 caracteres | Zod schema |
| Slug maximo 50 caracteres | Zod schema + maxLength |
| Slug apenas letras minusculas, numeros e hifen | Zod regex + handler |
| Slug nao comeca/termina com hifen | Zod refine |
| Slug verificado com debounce 500ms | useDebounce hook |
| Localizacao obrigatoria | Zod schema |
| Tamanho selecionado | Zod enum |
| Botao desabilitado durante loading | isButtonDisabled |
| Botao desabilitado se slug indisponivel | isButtonDisabled |
| Toast de sucesso | toast() |
| Redirecionar para /studio/dashboard | navigate() |
| Invalidar query has-studio | queryClient.invalidateQueries() |
| Tratamento de erro de slug duplicado | Verificar error.code === "23505" |

---

### Estados Visuais do Slug

| Estado | Icone | Cor | Mensagem |
|--------|-------|-----|----------|
| Vazio ou muito curto | Nenhum | - | - |
| Formato invalido | X | Vermelho | Erro de validacao |
| Verificando | Spinner | Cinza | - |
| Disponivel | Check | Verde | "Slug disponivel!" |
| Indisponivel | X | Vermelho | "Este slug ja esta em uso" |

