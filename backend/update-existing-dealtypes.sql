-- Atualizar dealType para anúncios de venda (assumindo que a maioria é venda)
-- Este script atualiza os registros que não têm dealType definido

-- Para anúncios de veículos, definir como 'Venda' por padrão
UPDATE listings
SET dealType = 'Venda'
WHERE type = 'vehicle' 
AND (dealType IS NULL OR dealType = '');

-- Para anúncios de imóveis, definir como 'Aluguel' ou 'Venda' baseado em alguma lógica
-- Por enquanto, vamos definir todos como 'Venda'
UPDATE listings
SET dealType = 'Venda'
WHERE type = 'property' 
AND (dealType IS NULL OR dealType = '');

-- Verificar os resultados
SELECT id, title, type, dealType, created_at 
FROM listings 
ORDER BY created_at DESC 
LIMIT 20;
