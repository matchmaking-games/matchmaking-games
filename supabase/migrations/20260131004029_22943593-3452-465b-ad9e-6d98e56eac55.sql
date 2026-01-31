-- Função RPC para verificar disponibilidade de slug de estúdio
CREATE OR REPLACE FUNCTION check_studio_slug_availability(slug_to_check text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM estudios WHERE slug = lower(slug_to_check)
  );
END;
$$;

-- Permissões para usuários autenticados e anônimos
GRANT EXECUTE ON FUNCTION check_studio_slug_availability(text) TO authenticated;
GRANT EXECUTE ON FUNCTION check_studio_slug_availability(text) TO anon;