-- ====================================
-- SETUP COMPLETO - TRACKER DE PESO E ALIMENTAÇÃO
-- ====================================

-- 1. CRIAR TABELA DE USUÁRIOS
CREATE TABLE IF NOT EXISTS ct_users (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. CRIAR TABELA DE PESO
CREATE TABLE IF NOT EXISTS ct_peso (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES ct_users(id) ON DELETE CASCADE,
  peso DECIMAL(5,2) NOT NULL,
  data DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. CRIAR TABELA DE REFEIÇÕES
CREATE TABLE IF NOT EXISTS ct_refeicoes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES ct_users(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  calorias INTEGER,
  tipo VARCHAR(50) CHECK (tipo IN ('cafe_da_manha', 'almoco', 'lanche', 'jantar', 'outro')),
  data DATE NOT NULL,
  horario TIME NOT NULL,
  imagem_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_ct_peso_data ON ct_peso(data DESC);
CREATE INDEX IF NOT EXISTS idx_ct_peso_user ON ct_peso(user_id);
CREATE INDEX IF NOT EXISTS idx_ct_refeicoes_data ON ct_refeicoes(data DESC);
CREATE INDEX IF NOT EXISTS idx_ct_refeicoes_user ON ct_refeicoes(user_id);
CREATE INDEX IF NOT EXISTS idx_ct_users_username ON ct_users(username);

-- 5. HABILITAR RLS (ROW LEVEL SECURITY)
ALTER TABLE ct_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ct_peso ENABLE ROW LEVEL SECURITY;
ALTER TABLE ct_refeicoes ENABLE ROW LEVEL SECURITY;

-- 6. CRIAR POLÍTICAS DE ACESSO (PERMITE TUDO SEM LOGIN)
-- Políticas para ct_users
DROP POLICY IF EXISTS "Permitir leitura pública" ON ct_users;
CREATE POLICY "Permitir leitura pública" ON ct_users 
  FOR SELECT USING (true);

-- Políticas para ct_peso
DROP POLICY IF EXISTS "Permitir leitura pública" ON ct_peso;
DROP POLICY IF EXISTS "Permitir inserção pública" ON ct_peso;
DROP POLICY IF EXISTS "Permitir atualização pública" ON ct_peso;
DROP POLICY IF EXISTS "Permitir exclusão pública" ON ct_peso;

CREATE POLICY "Permitir leitura pública" ON ct_peso 
  FOR SELECT USING (true);
CREATE POLICY "Permitir inserção pública" ON ct_peso 
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização pública" ON ct_peso 
  FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão pública" ON ct_peso 
  FOR DELETE USING (true);

-- Políticas para ct_refeicoes
DROP POLICY IF EXISTS "Permitir leitura pública" ON ct_refeicoes;
DROP POLICY IF EXISTS "Permitir inserção pública" ON ct_refeicoes;
DROP POLICY IF EXISTS "Permitir atualização pública" ON ct_refeicoes;
DROP POLICY IF EXISTS "Permitir exclusão pública" ON ct_refeicoes;

CREATE POLICY "Permitir leitura pública" ON ct_refeicoes 
  FOR SELECT USING (true);
CREATE POLICY "Permitir inserção pública" ON ct_refeicoes 
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização pública" ON ct_refeicoes 
  FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão pública" ON ct_refeicoes 
  FOR DELETE USING (true);

-- 7. POLÍTICAS PARA O STORAGE (BUCKET 'comida')
-- Assumindo que o bucket já foi criado manualmente
DROP POLICY IF EXISTS "Permitir upload público" ON storage.objects;
DROP POLICY IF EXISTS "Permitir visualização pública" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão pública" ON storage.objects;

CREATE POLICY "Permitir upload público" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'comida');

CREATE POLICY "Permitir visualização pública" ON storage.objects
  FOR SELECT USING (bucket_id = 'comida');

CREATE POLICY "Permitir exclusão pública" ON storage.objects
  FOR DELETE USING (bucket_id = 'comida');

-- 8. INSERIR USUÁRIO PEDRO CCM (SE NÃO EXISTIR)
INSERT INTO ct_users (nome, username, senha)
SELECT 'Pedro CCM', 'pedroccm', 'q1w2e3r4t5'
WHERE NOT EXISTS (
  SELECT 1 FROM ct_users WHERE username = 'pedroccm'
);

-- 9. DADOS DE EXEMPLO PARA PEDRO (OPCIONAL)
-- Busca o ID do Pedro para inserir os dados de exemplo
DO $$
DECLARE
  v_user_id INTEGER;
BEGIN
  SELECT id INTO v_user_id FROM ct_users WHERE username = 'pedroccm' LIMIT 1;
  
  -- Inserir registros de peso se não houver nenhum
  IF NOT EXISTS (SELECT 1 FROM ct_peso WHERE user_id = v_user_id) THEN
    INSERT INTO ct_peso (user_id, peso, data)
    VALUES 
      (v_user_id, 85.5, CURRENT_DATE - INTERVAL '7 days'),
      (v_user_id, 85.2, CURRENT_DATE - INTERVAL '5 days'),
      (v_user_id, 84.8, CURRENT_DATE - INTERVAL '3 days'),
      (v_user_id, 84.5, CURRENT_DATE - INTERVAL '1 day'),
      (v_user_id, 84.3, CURRENT_DATE);
  END IF;

  -- Inserir refeições se não houver nenhuma para hoje
  IF NOT EXISTS (SELECT 1 FROM ct_refeicoes WHERE user_id = v_user_id AND data = CURRENT_DATE) THEN
    INSERT INTO ct_refeicoes (user_id, nome, descricao, calorias, tipo, data, horario)
    VALUES 
      (v_user_id, 'Omelete com torradas', 'Omelete de 3 ovos com 2 torradas integrais', 350, 'cafe_da_manha', CURRENT_DATE, '08:00'),
      (v_user_id, 'Salada Caesar com frango', 'Salada completa com frango grelhado', 450, 'almoco', CURRENT_DATE, '12:30'),
      (v_user_id, 'Banana com pasta de amendoim', 'Lanche pré-treino', 200, 'lanche', CURRENT_DATE, '16:00'),
      (v_user_id, 'Salmão com legumes', 'Salmão grelhado com brócolis e cenoura', 500, 'jantar', CURRENT_DATE, '19:30');
  END IF;
END $$;