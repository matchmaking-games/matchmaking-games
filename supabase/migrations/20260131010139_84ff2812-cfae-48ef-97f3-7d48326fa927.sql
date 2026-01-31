-- Verificar se o trigger existe
SELECT * FROM pg_trigger WHERE tgname = 'trigger_auto_add_creator_as_super_admin';

-- Correção da função com SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.auto_add_creator_as_super_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO estudio_membros (estudio_id, user_id, role, adicionado_por)
  VALUES (NEW.id, NEW.criado_por, 'super_admin', NEW.criado_por);
  RETURN NEW;
END;
$$;