-- Criar bucket publico para imagens de projetos
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true);

-- Policy: Qualquer um pode visualizar (bucket publico)
CREATE POLICY "Imagens de projetos sao publicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-images');

-- Policy: Usuario autenticado pode fazer upload de suas proprias imagens
CREATE POLICY "User faz upload de imagens de seus projetos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Usuario pode atualizar suas proprias imagens
CREATE POLICY "User atualiza imagens de seus projetos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'project-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Usuario pode deletar suas proprias imagens
CREATE POLICY "User deleta imagens de seus projetos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);