-- ====================================
-- SETUP DEMO - TRACKER DE PESO E ALIMENTAÇÃO
-- Usuário demo com dados abundantes para demonstração
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

-- 8. INSERIR USUÁRIO DEMO (SE NÃO EXISTIR)
INSERT INTO ct_users (nome, username, senha)
SELECT 'Usuário Demo', 'demo', '123'
WHERE NOT EXISTS (
  SELECT 1 FROM ct_users WHERE username = 'demo'
);

-- 9. DADOS DEMO ABUNDANTES
-- Busca o ID do usuário demo para inserir os dados
DO $$
DECLARE
  v_user_id INTEGER;
BEGIN
  SELECT id INTO v_user_id FROM ct_users WHERE username = 'demo' LIMIT 1;

  -- Limpar dados existentes para evitar duplicatas
  DELETE FROM ct_peso WHERE user_id = v_user_id;
  DELETE FROM ct_refeicoes WHERE user_id = v_user_id;

  -- Inserir 3 meses de dados de peso (peso inicial 90kg, meta 80kg)
  INSERT INTO ct_peso (user_id, peso, data)
  VALUES
    -- Mês 1 (90 dias atrás até 60 dias atrás)
    (v_user_id, 90.5, CURRENT_DATE - INTERVAL '90 days'),
    (v_user_id, 90.3, CURRENT_DATE - INTERVAL '87 days'),
    (v_user_id, 90.1, CURRENT_DATE - INTERVAL '84 days'),
    (v_user_id, 89.8, CURRENT_DATE - INTERVAL '81 days'),
    (v_user_id, 89.6, CURRENT_DATE - INTERVAL '78 days'),
    (v_user_id, 89.4, CURRENT_DATE - INTERVAL '75 days'),
    (v_user_id, 89.1, CURRENT_DATE - INTERVAL '72 days'),
    (v_user_id, 88.9, CURRENT_DATE - INTERVAL '69 days'),
    (v_user_id, 88.7, CURRENT_DATE - INTERVAL '66 days'),
    (v_user_id, 88.4, CURRENT_DATE - INTERVAL '63 days'),
    (v_user_id, 88.2, CURRENT_DATE - INTERVAL '60 days'),

    -- Mês 2 (60 dias atrás até 30 dias atrás)
    (v_user_id, 88.0, CURRENT_DATE - INTERVAL '57 days'),
    (v_user_id, 87.8, CURRENT_DATE - INTERVAL '54 days'),
    (v_user_id, 87.5, CURRENT_DATE - INTERVAL '51 days'),
    (v_user_id, 87.3, CURRENT_DATE - INTERVAL '48 days'),
    (v_user_id, 87.1, CURRENT_DATE - INTERVAL '45 days'),
    (v_user_id, 86.8, CURRENT_DATE - INTERVAL '42 days'),
    (v_user_id, 86.6, CURRENT_DATE - INTERVAL '39 days'),
    (v_user_id, 86.4, CURRENT_DATE - INTERVAL '36 days'),
    (v_user_id, 86.1, CURRENT_DATE - INTERVAL '33 days'),
    (v_user_id, 85.9, CURRENT_DATE - INTERVAL '30 days'),

    -- Mês 3 (30 dias atrás até hoje)
    (v_user_id, 85.7, CURRENT_DATE - INTERVAL '27 days'),
    (v_user_id, 85.4, CURRENT_DATE - INTERVAL '24 days'),
    (v_user_id, 85.2, CURRENT_DATE - INTERVAL '21 days'),
    (v_user_id, 85.0, CURRENT_DATE - INTERVAL '18 days'),
    (v_user_id, 84.8, CURRENT_DATE - INTERVAL '15 days'),
    (v_user_id, 84.5, CURRENT_DATE - INTERVAL '12 days'),
    (v_user_id, 84.3, CURRENT_DATE - INTERVAL '9 days'),
    (v_user_id, 84.1, CURRENT_DATE - INTERVAL '6 days'),
    (v_user_id, 83.8, CURRENT_DATE - INTERVAL '3 days'),
    (v_user_id, 83.6, CURRENT_DATE - INTERVAL '1 day'),
    (v_user_id, 83.4, CURRENT_DATE);

  -- Inserir refeições dos últimos 7 dias
  -- DIA 7 (uma semana atrás)
  INSERT INTO ct_refeicoes (user_id, nome, descricao, calorias, tipo, data, horario)
  VALUES
    (v_user_id, 'Aveia com frutas', 'Aveia integral com banana, morango e mel', 280, 'cafe_da_manha', CURRENT_DATE - INTERVAL '7 days', '07:30'),
    (v_user_id, 'Smoothie verde', 'Espinafre, maçã, banana e gengibre', 150, 'lanche', CURRENT_DATE - INTERVAL '7 days', '10:00'),
    (v_user_id, 'Peixe grelhado com quinoa', 'Tilápia grelhada com quinoa e vegetais', 420, 'almoco', CURRENT_DATE - INTERVAL '7 days', '12:00'),
    (v_user_id, 'Mix de castanhas', '30g de castanhas variadas', 180, 'lanche', CURRENT_DATE - INTERVAL '7 days', '15:30'),
    (v_user_id, 'Salada de frango', 'Salada completa com peito de frango grelhado', 350, 'jantar', CURRENT_DATE - INTERVAL '7 days', '19:00'),

    -- DIA 6
    (v_user_id, 'Tapioca com ovos', 'Tapioca recheada com ovos mexidos', 320, 'cafe_da_manha', CURRENT_DATE - INTERVAL '6 days', '08:00'),
    (v_user_id, 'Água de coco', 'Água de coco natural', 60, 'lanche', CURRENT_DATE - INTERVAL '6 days', '10:30'),
    (v_user_id, 'Carne magra com batata doce', 'Carne magra grelhada com batata doce assada', 480, 'almoco', CURRENT_DATE - INTERVAL '6 days', '12:30'),
    (v_user_id, 'Iogurte natural com granola', 'Iogurte desnatado com granola caseira', 200, 'lanche', CURRENT_DATE - INTERVAL '6 days', '16:00'),
    (v_user_id, 'Sopa de legumes', 'Sopa nutritiva com diversos legumes', 180, 'jantar', CURRENT_DATE - INTERVAL '6 days', '19:30'),

    -- DIA 5
    (v_user_id, 'Panqueca de banana', 'Panqueca integral com banana e canela', 250, 'cafe_da_manha', CURRENT_DATE - INTERVAL '5 days', '07:45'),
    (v_user_id, 'Suco verde detox', 'Couve, limão, gengibre e água', 80, 'lanche', CURRENT_DATE - INTERVAL '5 days', '10:15'),
    (v_user_id, 'Frango com arroz integral', 'Peito de frango com arroz integral e brócolis', 450, 'almoco', CURRENT_DATE - INTERVAL '5 days', '12:15'),
    (v_user_id, 'Abacate vitamina', 'Vitamina de abacate com leite desnatado', 220, 'lanche', CURRENT_DATE - INTERVAL '5 days', '15:45'),
    (v_user_id, 'Peixe assado', 'Salmão assado com aspargos', 380, 'jantar', CURRENT_DATE - INTERVAL '5 days', '20:00'),

    -- DIA 4
    (v_user_id, 'Pão integral com abacate', 'Torrada integral com abacate e tomate', 290, 'cafe_da_manha', CURRENT_DATE - INTERVAL '4 days', '08:15'),
    (v_user_id, 'Chá verde', 'Chá verde com limão', 5, 'lanche', CURRENT_DATE - INTERVAL '4 days', '10:45'),
    (v_user_id, 'Salada de grão de bico', 'Salada nutritiva com grão de bico e vegetais', 380, 'almoco', CURRENT_DATE - INTERVAL '4 days', '12:45'),
    (v_user_id, 'Frutas vermelhas', 'Mix de morangos, amoras e mirtilos', 120, 'lanche', CURRENT_DATE - INTERVAL '4 days', '16:30'),
    (v_user_id, 'Omelete de vegetais', 'Omelete com espinafre, tomate e queijo cottage', 320, 'jantar', CURRENT_DATE - INTERVAL '4 days', '19:15'),

    -- DIA 3
    (v_user_id, 'Mingau de aveia', 'Mingau de aveia com canela e maçã', 260, 'cafe_da_manha', CURRENT_DATE - INTERVAL '3 days', '07:20'),
    (v_user_id, 'Água saborizada', 'Água com rodelas de pepino e limão', 10, 'lanche', CURRENT_DATE - INTERVAL '3 days', '09:30'),
    (v_user_id, 'Macarrão integral com molho de tomate', 'Macarrão integral com molho caseiro e manjericão', 420, 'almoco', CURRENT_DATE - INTERVAL '3 days', '13:00'),
    (v_user_id, 'Biscoito integral', '3 biscoitos integrais com fibras', 150, 'lanche', CURRENT_DATE - INTERVAL '3 days', '15:15'),
    (v_user_id, 'Caldo de legumes', 'Caldo nutritivo com cenoura, aipo e batata', 160, 'jantar', CURRENT_DATE - INTERVAL '3 days', '20:30'),

    -- DIA 2 (ontem)
    (v_user_id, 'Açaí com granola', 'Açaí natural com granola e banana', 340, 'cafe_da_manha', CURRENT_DATE - INTERVAL '2 days', '08:30'),
    (v_user_id, 'Suco de laranja natural', 'Suco de laranja espremido na hora', 110, 'lanche', CURRENT_DATE - INTERVAL '2 days', '10:00'),
    (v_user_id, 'Hambúrguer caseiro', 'Hambúrguer de carne magra com salada', 520, 'almoco', CURRENT_DATE - INTERVAL '2 days', '12:20'),
    (v_user_id, 'Barra de cereal', 'Barra de cereal integral', 140, 'lanche', CURRENT_DATE - INTERVAL '2 days', '16:15'),
    (v_user_id, 'Risoto de cogumelos', 'Risoto integral com cogumelos variados', 400, 'jantar', CURRENT_DATE - INTERVAL '2 days', '19:45'),

    -- DIA 1 (ontem)
    (v_user_id, 'Vitamina de frutas', 'Vitamina com manga, banana e leite', 280, 'cafe_da_manha', CURRENT_DATE - INTERVAL '1 day', '07:50'),
    (v_user_id, 'Café preto', 'Café sem açúcar', 5, 'lanche', CURRENT_DATE - INTERVAL '1 day', '09:45'),
    (v_user_id, 'Wrap de frango', 'Wrap integral com frango desfiado e vegetais', 380, 'almoco', CURRENT_DATE - INTERVAL '1 day', '12:10'),
    (v_user_id, 'Maçã', 'Maçã vermelha média', 95, 'lanche', CURRENT_DATE - INTERVAL '1 day', '15:30'),
    (v_user_id, 'Lasanha de berinjela', 'Lasanha com berinjela ao invés de massa', 350, 'jantar', CURRENT_DATE - INTERVAL '1 day', '20:15'),

    -- HOJE
    (v_user_id, 'Omelete proteica', 'Omelete de 3 claras com 1 gema e espinafre', 190, 'cafe_da_manha', CURRENT_DATE, '08:00'),
    (v_user_id, 'Chá de hibisco', 'Chá de hibisco gelado', 8, 'lanche', CURRENT_DATE, '10:30'),
    (v_user_id, 'Salada Caesar light', 'Salada Caesar com frango grelhado e molho light', 320, 'almoco', CURRENT_DATE, '12:30'),
    (v_user_id, 'Amendoim', '20g de amendoim torrado', 115, 'lanche', CURRENT_DATE, '16:00'),
    (v_user_id, 'Peixe com purê de couve-flor', 'Pescada assada com purê de couve-flor', 280, 'jantar', CURRENT_DATE, '19:30');

  -- Inserir mais refeições históricas (últimos 30 dias) para ter dados abundantes
  INSERT INTO ct_refeicoes (user_id, nome, descricao, calorias, tipo, data, horario)
  SELECT
    v_user_id,
    CASE (random() * 20)::integer
      WHEN 0 THEN 'Aveia com frutas'
      WHEN 1 THEN 'Tapioca com queijo'
      WHEN 2 THEN 'Pão integral com geleia'
      WHEN 3 THEN 'Mingau de aveia'
      WHEN 4 THEN 'Smoothie proteico'
      WHEN 5 THEN 'Panqueca integral'
      WHEN 6 THEN 'Iogurte com granola'
      WHEN 7 THEN 'Vitamina de frutas'
      WHEN 8 THEN 'Omelete fitness'
      WHEN 9 THEN 'Açaí natural'
      WHEN 10 THEN 'Café com torrada'
      WHEN 11 THEN 'Cereal integral'
      WHEN 12 THEN 'Crepe de banana'
      WHEN 13 THEN 'Torrada abacate'
      WHEN 14 THEN 'Leite com aveia'
      WHEN 15 THEN 'Frutas variadas'
      WHEN 16 THEN 'Wrap de ovos'
      WHEN 17 THEN 'Suco natural'
      WHEN 18 THEN 'Bolo integral'
      ELSE 'Café da manhã saudável'
    END as nome,
    'Café da manhã nutritivo e balanceado' as descricao,
    (200 + random() * 200)::integer as calorias,
    'cafe_da_manha' as tipo,
    CURRENT_DATE - INTERVAL '1 day' * generate_series(8, 30) as data,
    ('07:' || lpad((30 + random() * 29)::integer::text, 2, '0'))::time as horario
  FROM generate_series(8, 30);

  -- Almoços históricos
  INSERT INTO ct_refeicoes (user_id, nome, descricao, calorias, tipo, data, horario)
  SELECT
    v_user_id,
    CASE (random() * 15)::integer
      WHEN 0 THEN 'Frango grelhado com arroz'
      WHEN 1 THEN 'Peixe com quinoa'
      WHEN 2 THEN 'Carne magra com batata doce'
      WHEN 3 THEN 'Salada completa'
      WHEN 4 THEN 'Macarrão integral'
      WHEN 5 THEN 'Risoto de vegetais'
      WHEN 6 THEN 'Hambúrguer caseiro'
      WHEN 7 THEN 'Wrap de frango'
      WHEN 8 THEN 'Sopa de legumes'
      WHEN 9 THEN 'Grão de bico refogado'
      WHEN 10 THEN 'Lasanha de berinjela'
      WHEN 11 THEN 'Salmão grelhado'
      WHEN 12 THEN 'Estrogonofe light'
      WHEN 13 THEN 'Curry de vegetais'
      ELSE 'Prato principal saudável'
    END as nome,
    'Almoço balanceado com proteínas e carboidratos' as descricao,
    (350 + random() * 250)::integer as calorias,
    'almoco' as tipo,
    CURRENT_DATE - INTERVAL '1 day' * generate_series(8, 30) as data,
    ('12:' || lpad((15 + random() * 44)::integer::text, 2, '0'))::time as horario
  FROM generate_series(8, 30);

  -- Jantares históricos
  INSERT INTO ct_refeicoes (user_id, nome, descricao, calorias, tipo, data, horario)
  SELECT
    v_user_id,
    CASE (random() * 12)::integer
      WHEN 0 THEN 'Salada de frango'
      WHEN 1 THEN 'Peixe assado'
      WHEN 2 THEN 'Omelete de vegetais'
      WHEN 3 THEN 'Sopa nutritiva'
      WHEN 4 THEN 'Caldo de legumes'
      WHEN 5 THEN 'Frango refogado'
      WHEN 6 THEN 'Purê de batata doce'
      WHEN 7 THEN 'Salada mista'
      WHEN 8 THEN 'Wrap light'
      WHEN 9 THEN 'Peixe grelhado'
      WHEN 10 THEN 'Vegetais no vapor'
      ELSE 'Jantar leve'
    END as nome,
    'Jantar leve e nutritivo' as descricao,
    (200 + random() * 200)::integer as calorias,
    'jantar' as tipo,
    CURRENT_DATE - INTERVAL '1 day' * generate_series(8, 30) as data,
    ('19:' || lpad((15 + random() * 44)::integer::text, 2, '0'))::time as horario
  FROM generate_series(8, 30);

  -- Lanches históricos
  INSERT INTO ct_refeicoes (user_id, nome, descricao, calorias, tipo, data, horario)
  SELECT
    v_user_id,
    CASE (random() * 10)::integer
      WHEN 0 THEN 'Frutas variadas'
      WHEN 1 THEN 'Castanhas'
      WHEN 2 THEN 'Iogurte natural'
      WHEN 3 THEN 'Barra de cereal'
      WHEN 4 THEN 'Smoothie'
      WHEN 5 THEN 'Água de coco'
      WHEN 6 THEN 'Biscoito integral'
      WHEN 7 THEN 'Chá verde'
      WHEN 8 THEN 'Vitamina'
      ELSE 'Lanche saudável'
    END as nome,
    'Lanche entre as refeições principais' as descricao,
    (80 + random() * 120)::integer as calorias,
    'lanche' as tipo,
    CURRENT_DATE - INTERVAL '1 day' * generate_series(8, 30) as data,
    ('15:' || lpad((15 + random() * 44)::integer::text, 2, '0'))::time as horario
  FROM generate_series(8, 30);

END $$;

-- Mensagem de sucesso
SELECT 'Banco de dados demo criado com sucesso!' as status,
       'Login: demo' as usuario,
       'Senha: 123' as senha,
       (SELECT COUNT(*) FROM ct_peso WHERE user_id = (SELECT id FROM ct_users WHERE username = 'demo')) as registros_peso,
       (SELECT COUNT(*) FROM ct_refeicoes WHERE user_id = (SELECT id FROM ct_users WHERE username = 'demo')) as registros_refeicoes;