
-- Drop overly permissive policies on studio-logos bucket
DROP POLICY IF EXISTS "Usuarios autenticados podem fazer upload de logos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados podem atualizar logos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados podem deletar logos" ON storage.objects;

-- Studio logos are publicly readable
CREATE POLICY "Studio logos are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'studio-logos');

-- Only studio super_admin can upload logo
CREATE POLICY "Only studio super_admin can upload logo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'studio-logos'
  AND EXISTS (
    SELECT 1 FROM public.estudio_membros
    WHERE estudio_membros.estudio_id::text = (storage.foldername(name))[1]
      AND estudio_membros.user_id = (SELECT auth.uid())
      AND estudio_membros.role = 'super_admin'
      AND estudio_membros.ativo = true
  )
);

-- Only studio super_admin can update logo
CREATE POLICY "Only studio super_admin can update logo"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'studio-logos'
  AND EXISTS (
    SELECT 1 FROM public.estudio_membros
    WHERE estudio_membros.estudio_id::text = (storage.foldername(name))[1]
      AND estudio_membros.user_id = (SELECT auth.uid())
      AND estudio_membros.role = 'super_admin'
      AND estudio_membros.ativo = true
  )
);

-- Only studio super_admin can delete logo
CREATE POLICY "Only studio super_admin can delete logo"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'studio-logos'
  AND EXISTS (
    SELECT 1 FROM public.estudio_membros
    WHERE estudio_membros.estudio_id::text = (storage.foldername(name))[1]
      AND estudio_membros.user_id = (SELECT auth.uid())
      AND estudio_membros.role = 'super_admin'
      AND estudio_membros.ativo = true
  )
);
