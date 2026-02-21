import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ImportResult {
  extracted_data: Record<string, unknown>;
  raw_text: Record<string, unknown>;
}

export function useImportLinkedIn() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<string | null>(null);

  const uploadPdf = async (file: File): Promise<ImportResult | null> => {
    setIsProcessing(true);
    setError(null);
    errorRef.current = null;
    setProgress("Enviando PDF...");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        const msg = "Sessão expirada. Faça login novamente.";
        setError(msg);
        errorRef.current = msg;
        return null;
      }

      const formData = new FormData();
      formData.append("pdf", file);

      setProgress("Analisando currículo com IA... isso pode levar até 30 segundos");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);

      let response: Response;
      try {
        response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-linkedin-pdf`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${session.access_token}` },
            body: formData,
            signal: controller.signal,
          }
        );
      } catch (fetchErr: unknown) {
        clearTimeout(timeoutId);
        if (fetchErr instanceof DOMException && fetchErr.name === "AbortError") {
          const msg = "O processamento demorou mais que o esperado. Tente com um PDF menor ou tente novamente mais tarde.";
          setError(msg);
          errorRef.current = msg;
          return null;
        }
        const msg = "Erro ao processar PDF. Verifique sua conexão e tente novamente.";
        setError(msg);
        errorRef.current = msg;
        return null;
      }

      clearTimeout(timeoutId);

      if (!response.ok) {
        let msg: string;
        switch (response.status) {
          case 429:
            msg = "Você atingiu o limite de 3 importações este mês. Tente novamente no próximo mês.";
            break;
          case 400:
            msg = "PDF inválido ou corrompido. Certifique-se de usar o PDF gerado diretamente pelo LinkedIn.";
            break;
          case 500:
            msg = "Erro no processamento com IA. Tente novamente em alguns minutos.";
            break;
          default:
            msg = "Erro inesperado. Tente novamente.";
        }
        setError(msg);
        errorRef.current = msg;
        return null;
      }

      const json = await response.json();
      return json.data as ImportResult;
    } catch {
      const msg = "Erro ao processar PDF. Verifique sua conexão e tente novamente.";
      setError(msg);
      errorRef.current = msg;
      return null;
    } finally {
      setIsProcessing(false);
      setProgress("");
    }
  };

  return { uploadPdf, isProcessing, progress, error, errorRef };
}
