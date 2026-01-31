

## Plano Corrigido: Upload de Logo na Criacao de Estudio

### Correcoes Aplicadas

| Correcao | Status |
|----------|--------|
| Migration SQL: Apenas policies RLS (sem INSERT INTO storage.buckets) | Aplicado |
| Migration SQL: DROP POLICY IF EXISTS antes de CREATE POLICY | Aplicado |
| uploadStudioLogo: Sem cache buster (?t=${Date.now()}) | Aplicado |

---

### Acao Manual Necessaria

**IMPORTANTE**: Antes de testar, criar o bucket manualmente no Supabase Dashboard:

1. Acessar: https://supabase.com/dashboard/project/njyoimhjfqtygnlccjzq/storage/buckets
2. Clicar em "Create Bucket"
3. Configurar:
   - Nome: `studio-logos`
   - Public bucket: Sim
   - File size limit: `3145728` (3MB)
   - Allowed MIME types: `image/jpeg, image/png, image/webp`

---

### Arquivos a Criar/Modificar

| Acao | Arquivo | Descricao |
|------|---------|-----------|
| Criar | Migration SQL | Policies RLS para bucket studio-logos |
| Criar | `src/components/studio/StudioLogoUpload.tsx` | Componente de upload |
| Modificar | `src/pages/studio/NewStudio.tsx` | Integrar upload de logo |

---

### Secao Tecnica

#### 1. Migration SQL (APENAS Policies RLS)

```sql
-- Policy: Usuarios autenticados podem fazer upload
DROP POLICY IF EXISTS "Usuarios autenticados podem fazer upload de logos" ON storage.objects;
CREATE POLICY "Usuarios autenticados podem fazer upload de logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'studio-logos');

-- Policy: Logos sao publicos (qualquer pessoa pode ver)
DROP POLICY IF EXISTS "Logos de estudios sao publicos" ON storage.objects;
CREATE POLICY "Logos de estudios sao publicos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'studio-logos');

-- Policy: Usuarios autenticados podem atualizar (upsert)
DROP POLICY IF EXISTS "Usuarios autenticados podem atualizar logos" ON storage.objects;
CREATE POLICY "Usuarios autenticados podem atualizar logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'studio-logos');

-- Policy: Usuarios autenticados podem deletar seus logos
DROP POLICY IF EXISTS "Usuarios autenticados podem deletar logos" ON storage.objects;
CREATE POLICY "Usuarios autenticados podem deletar logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'studio-logos');
```

---

#### 2. Componente StudioLogoUpload.tsx

```typescript
// src/components/studio/StudioLogoUpload.tsx

import { useState, useRef } from "react";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StudioLogoUploadProps {
  onFileSelected: (file: File) => void;
  previewUrl: string | null;
  error: string | null;
  disabled?: boolean;
}

export function StudioLogoUpload({
  onFileSelected,
  previewUrl,
  error,
  disabled,
}: StudioLogoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        Logo do estudio *
      </label>

      <div
        className={cn(
          "relative w-32 h-32 mx-auto rounded-xl overflow-hidden transition-colors cursor-pointer",
          "border-2 border-dashed",
          isDragOver
            ? "border-primary bg-primary/10"
            : previewUrl
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/40 bg-muted/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Preview do logo"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-background/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button type="button" variant="secondary" size="sm">
                Trocar
              </Button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <ImagePlus className="h-8 w-8 mb-2" />
            <span className="text-xs text-center px-2">Clique para selecionar</span>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        JPG, PNG ou WebP - Maximo 3MB
      </p>

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}
    </div>
  );
}
```

---

#### 3. Modificacoes no NewStudio.tsx

**Novos imports:**

```typescript
import { StudioLogoUpload } from "@/components/studio/StudioLogoUpload";
```

**Funcao de validacao de imagem:**

```typescript
interface ImageValidation {
  valid: boolean;
  error?: string;
}

function validateImage(file: File): ImageValidation {
  const MAX_SIZE = 3 * 1024 * 1024; // 3MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato nao suportado. Use JPG, PNG ou WebP.'
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: 'Imagem muito grande. Maximo 3MB.'
    };
  }

  return { valid: true };
}
```

**Funcao de upload (SEM cache buster):**

```typescript
async function uploadStudioLogo(file: File, studioId: string): Promise<string> {
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
  const fileName = `${studioId}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('studio-logos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('studio-logos')
    .getPublicUrl(fileName);

  return data.publicUrl; // SEM ?t=${Date.now()}
}
```

**Novos estados:**

```typescript
// Logo upload states
const [logoFile, setLogoFile] = useState<File | null>(null);
const [logoPreview, setLogoPreview] = useState<string | null>(null);
const [logoError, setLogoError] = useState<string | null>(null);
```

**Handler de selecao de arquivo:**

```typescript
const handleLogoSelected = (file: File) => {
  const validation = validateImage(file);
  if (!validation.valid) {
    setLogoError(validation.error || null);
    return;
  }

  setLogoError(null);
  setLogoFile(file);

  // Criar preview
  const reader = new FileReader();
  reader.onloadend = () => {
    setLogoPreview(reader.result as string);
  };
  reader.readAsDataURL(file);
};
```

**Modificar handleSubmit (fluxo em 3 etapas):**

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setValidationErrors({});

  // Validar se logo foi selecionado
  if (!logoFile) {
    setLogoError("Selecione um logo para o estudio.");
    return;
  }

  // ... validacoes Zod existentes ...

  setIsSubmitting(true);

  // ... verificar sessao existente ...

  // 1. Inserir estudio (sem logo_url)
  const { data: newStudio, error: insertError } = await supabase
    .from("estudios")
    .insert({
      nome: nome,
      slug: slug,
      localizacao: localizacao,
      tamanho: tamanho as "micro" | "pequeno" | "medio" | "grande",
      criado_por: session.user.id,
    })
    .select()
    .single();

  if (insertError) {
    setIsSubmitting(false);
    // ... tratamento de erro existente ...
    return;
  }

  // 2. Upload do logo
  try {
    const logoUrl = await uploadStudioLogo(logoFile, newStudio.id);

    // 3. Atualizar estudio com logo_url
    const { error: updateError } = await supabase
      .from("estudios")
      .update({ logo_url: logoUrl })
      .eq("id", newStudio.id);

    if (updateError) {
      console.error("Error updating logo:", updateError);
      toast({
        title: "Estudio criado!",
        description: "Mas houve um erro ao salvar o logo. Voce pode adicionar depois.",
      });
    } else {
      toast({
        title: "Estudio criado!",
        description: "Seu estudio foi criado com sucesso.",
      });
    }
  } catch (uploadError) {
    console.error("Error uploading logo:", uploadError);
    toast({
      title: "Estudio criado!",
      description: "Mas houve um erro ao fazer upload do logo. Voce pode adicionar depois.",
    });
  }

  setIsSubmitting(false);
  queryClient.invalidateQueries({ queryKey: ["has-studio"] });
  navigate("/studio/dashboard");
};
```

**Atualizar isButtonDisabled:**

```typescript
const isButtonDisabled =
  isSubmitting ||
  !logoFile ||        // Logo obrigatorio
  !nome ||
  !slug ||
  !localizacao ||
  !tamanho ||
  !isSlugFormatValid ||
  isChecking ||
  isAvailable !== true;
```

**Render do upload (antes do campo Nome):**

```tsx
<form onSubmit={handleSubmit} className="space-y-6">
  {/* Logo do Estudio - PRIMEIRO CAMPO */}
  <StudioLogoUpload
    onFileSelected={handleLogoSelected}
    previewUrl={logoPreview}
    error={logoError}
    disabled={isSubmitting}
  />

  {/* Nome do Estudio */}
  <div className="space-y-2">
    {/* ... campo nome existente ... */}
  </div>

  {/* ... resto do formulario ... */}
</form>
```

---

### Estrutura de Pastas

```text
src/
  components/
    studio/
      StudioLogoUpload.tsx    <- CRIAR
  pages/
    studio/
      NewStudio.tsx           <- MODIFICAR
```

---

### Ordem de Implementacao

| Ordem | Arquivo | Acao |
|-------|---------|------|
| 0 | Supabase Dashboard | Criar bucket studio-logos manualmente |
| 1 | Migration SQL | Policies RLS (DROP IF EXISTS + CREATE) |
| 2 | `src/components/studio/StudioLogoUpload.tsx` | Criar componente |
| 3 | `src/pages/studio/NewStudio.tsx` | Integrar upload |

---

### Checklist Final

| Item | Status |
|------|--------|
| Bucket criado via Dashboard (nao via SQL) | Manual |
| DROP POLICY IF EXISTS antes de CREATE | SQL idempotente |
| Sem cache buster na URL | data.publicUrl direto |
| Limite 3MB client-side | validateImage() |
| Tipos JPG/PNG/WebP | validateImage() |
| Preview local | FileReader.readAsDataURL |
| Nome do arquivo: {studioId}.{ext} | uploadStudioLogo() |
| Upload apos criar estudio | handleSubmit modificado |
| Atualizar logo_url apos upload | handleSubmit modificado |
| Botao desabilitado sem logo | isButtonDisabled |

