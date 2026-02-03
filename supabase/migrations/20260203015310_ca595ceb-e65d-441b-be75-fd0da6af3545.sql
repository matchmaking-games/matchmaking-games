-- Criar tabela pagamentos para registrar transações Stripe
CREATE TABLE pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudio_id UUID NOT NULL REFERENCES estudios(id) ON DELETE CASCADE,
  vaga_id UUID REFERENCES vagas(id) ON DELETE SET NULL,
  stripe_session_id TEXT NOT NULL,
  stripe_payment_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'brl',
  status TEXT DEFAULT 'pending',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(stripe_session_id)
);

-- Habilitar RLS
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;

-- Apenas super_admin do estúdio pode VER pagamentos
CREATE POLICY "Studio ve proprios pagamentos" ON pagamentos
FOR SELECT
USING (
  estudio_id IN (
    SELECT estudio_id FROM estudio_membros
    WHERE user_id = auth.uid() 
      AND role = 'super_admin'
      AND ativo = true
  )
);

-- CREATE INDEX para melhor performance nas queries
CREATE INDEX pagamentos_estudio_id_idx ON pagamentos(estudio_id);
CREATE INDEX pagamentos_vaga_id_idx ON pagamentos(vaga_id);
CREATE INDEX pagamentos_stripe_session_id_idx ON pagamentos(stripe_session_id);