import { useState, useRef } from "react";
import { Loader2, ImagePlus, X } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSupportForm, supportFormSchema, validateImage } from "@/hooks/useSupportForm";

export default function Support() {
  const { toast } = useToast();
  const { submitForm, isSubmitting, isSuccess, resetSuccess, tipos } = useSupportForm();

  const [tipo, setTipo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [imagem, setImagem] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [imagemError, setImagemError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateImage(file);
    if (validationError) {
      setImagemError(validationError);
      setImagem(null);
      setImagemPreview(null);
      return;
    }

    setImagemError(null);
    setImagem(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagemPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagem(null);
    setImagemPreview(null);
    setImagemError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetForm = () => {
    setTipo("");
    setMensagem("");
    removeImage();
    setErrors({});
    resetSuccess();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = supportFormSchema.safeParse({ tipo, mensagem });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as string;
        fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      await submitForm(result.data, imagem);
      toast({
        title: "Mensagem enviada!",
        description: "Entraremos em contato em breve.",
      });
      resetForm();
    } catch {
      toast({
        title: "Erro ao enviar mensagem.",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div>
              <h1 className="font-display font-bold text-4xl text-foreground">Suporte</h1>
              <p className="text-muted-foreground mt-1">
                Envie sua dúvida, reporte um bug ou faça uma sugestão. Responderemos por email.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Tipo */}
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger id="tipo">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tipos.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tipo && (
                  <p className="text-sm text-destructive">{errors.tipo}</p>
                )}
              </div>

              {/* Mensagem */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="mensagem">Mensagem</Label>
                  <span className="text-xs text-muted-foreground">
                    {mensagem.length}/2000
                  </span>
                </div>
                <Textarea
                  id="mensagem"
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Descreva com detalhes. Se for um bug, inclua o que você estava fazendo antes de acontecer."
                  className="min-h-[160px]"
                  maxLength={2000}
                />
                {errors.mensagem && (
                  <p className="text-sm text-destructive">{errors.mensagem}</p>
                )}
              </div>

              {/* Imagem */}
              <div className="space-y-2">
                <Label>Imagem (opcional)</Label>
                {imagemPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagemPreview}
                      alt="Preview"
                      className="h-24 w-24 rounded-md object-cover border border-border"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="h-4 w-4 mr-2" />
                    Anexar imagem
                  </Button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleImageChange}
                />
                {imagemError && (
                  <p className="text-sm text-destructive">{imagemError}</p>
                )}
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar mensagem"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
