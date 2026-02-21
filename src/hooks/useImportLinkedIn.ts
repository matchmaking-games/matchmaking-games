import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.4.624/build/pdf.worker.min.mjs`;

interface ImportResult {
  extracted_data: Record<string, unknown>;
  raw_text: Record<string, unknown>;
}

export function useImportLinkedIn() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<string | null>(null);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => ("str" in item ? item.str : "")).join(" ");
      pages.push(pageText);
    }
    return pages.join("\n");
  };

  const uploadPdf = async (file: File): Promise<ImportResult | null> => {
    setIsProcessing(true);
    setError(null);
    errorRef.current = null;
    setProgress("Lendo arquivo PDF...");

    try {
      // 1. Extract text from PDF locally
      const fullText = await extractTextFromPDF(file);

      if (fullText.trim().length < 100) {
        const msg =
          "Não foi possível extrair texto do PDF. Certifique-se de usar o PDF gerado diretamente pelo LinkedIn.";
        setError(msg);
        errorRef.current = msg;
        return null;
      }

      // 2. Update progress
      setProgress("Analisando currículo com IA... isso pode levar até 30 segundos");

      // 3. Get session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        const msg = "Sessão expirada. Faça login novamente.";
        setError(msg);
        errorRef.current = msg;
        return null;
      }

      // 4. Send text to Edge Function
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);

      let response: Response;
      try {
        response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-linkedin-pdf`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: fullText, filename: file.name }),
          signal: controller.signal,
        });
      } catch (fetchErr: unknown) {
        clearTimeout(timeoutId);
        if (fetchErr instanceof DOMException && fetchErr.name === "AbortError") {
          const msg = "O processamento demorou mais que o esperado. Tente novamente.";
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
            msg = "Não foi possível processar o PDF. Certifique-se de usar o PDF gerado diretamente pelo LinkedIn.";
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
    } catch (err) {
      console.error("IMPORT ERROR:", err);
      const msg = "Erro ao processar PDF...";
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
