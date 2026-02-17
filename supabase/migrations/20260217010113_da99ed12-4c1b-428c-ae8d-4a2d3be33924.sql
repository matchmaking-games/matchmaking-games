
-- Function 1: Get invite by token (public, no auth required)
CREATE OR REPLACE FUNCTION get_invite_by_token(invite_token text)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'id', c.id,
    'estudio_id', c.estudio_id,
    'email_convidado', c.email_convidado,
    'role', c.role,
    'aceito', c.aceito,
    'expira_em', c.expira_em,
    'estudio_nome', e.nome,
    'estudio_logo_url', e.logo_url
  ) INTO result
  FROM estudio_convites c
  JOIN estudios e ON e.id = c.estudio_id
  WHERE c.token = invite_token;

  RETURN result;
END;
$$;

-- Function 2: Accept studio invite (requires auth)
CREATE OR REPLACE FUNCTION accept_studio_invite(invite_token text)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_invite RECORD;
  v_user_email TEXT;
  v_user_id UUID;
  v_existing_member UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  SELECT * INTO v_invite FROM estudio_convites WHERE token = invite_token;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'not_found');
  END IF;

  IF v_invite.expira_em < now() THEN
    RETURN json_build_object('success', false, 'error', 'expired');
  END IF;

  IF v_invite.aceito THEN
    RETURN json_build_object('success', false, 'error', 'already_accepted');
  END IF;

  SELECT email INTO v_user_email FROM users WHERE id = v_user_id;
  IF v_user_email IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'no_profile');
  END IF;

  IF lower(v_user_email) != lower(v_invite.email_convidado) THEN
    RETURN json_build_object('success', false, 'error', 'email_mismatch');
  END IF;

  SELECT id INTO v_existing_member
  FROM estudio_membros
  WHERE user_id = v_user_id AND estudio_id = v_invite.estudio_id AND ativo = true;

  IF v_existing_member IS NOT NULL THEN
    UPDATE estudio_convites SET aceito = true WHERE id = v_invite.id;
    RETURN json_build_object('success', true, 'already_member', true);
  END IF;

  INSERT INTO estudio_membros (estudio_id, user_id, role, adicionado_por, ativo)
  VALUES (v_invite.estudio_id, v_user_id, v_invite.role, v_invite.convidado_por, true);

  UPDATE estudio_convites SET aceito = true WHERE id = v_invite.id;

  RETURN json_build_object('success', true, 'already_member', false);
END;
$$;
