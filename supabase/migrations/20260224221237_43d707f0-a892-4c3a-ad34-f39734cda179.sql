-- Performance indexes for RLS policy subqueries on estudio_membros
CREATE INDEX IF NOT EXISTS idx_estudio_membros_estudio_user
  ON estudio_membros(estudio_id, user_id);

CREATE INDEX IF NOT EXISTS idx_estudio_membros_user_role_ativo
  ON estudio_membros(user_id, role, ativo);

CREATE INDEX IF NOT EXISTS idx_vagas_estudio_id
  ON vagas(estudio_id);