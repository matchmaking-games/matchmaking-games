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