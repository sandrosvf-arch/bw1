// Script para popular o banco com mais anúncios
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function populateListings() {
  try {
    // Buscar usuário
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (!users || users.length === 0) {
      console.log('❌ Nenhum usuário encontrado!');
      return;
    }

    const user = users[0];

    // NÃO deletar anúncios existentes!
    // Apenas adicionar novos

    const listings = [
      // Veículos
      {
        user_id: user.id,
        title: 'Honda Civic 2020 - Automático',
        description: 'Honda Civic EX 2020, completo, único dono.',
        price: 95000,
        category: 'vehicle',
        type: 'car',
        dealType: 'Venda',
        location: { city: 'Curitiba', state: 'PR', neighborhood: 'Batel' },
        images: ['https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1400&q=80'],
        details: { year: 2020, km: 35000, fuel: 'Gasolina', transmission: 'Automático', color: 'Prata', doors: 4 },
        contact: { name: user.name, phone: '(41) 99999-9999', whatsapp: '5541999999999' },
        status: 'active'
      },
      {
        user_id: user.id,
        title: 'Toyota Corolla 2021 - XEI',
        description: 'Toyota Corolla XEI 2021, baixa km, garantia de fábrica.',
        price: 115000,
        category: 'vehicle',
        type: 'car',
        dealType: 'Venda',
        location: { city: 'São Paulo', state: 'SP', neighborhood: 'Vila Mariana' },
        images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1400&q=80'],
        details: { year: 2021, km: 25000, fuel: 'Flex', transmission: 'Automático', color: 'Branco', doors: 4 },
        contact: { name: user.name, phone: '(11) 98888-8888', whatsapp: '5511988888888' },
        status: 'active'
      },
      {
        user_id: user.id,
        title: 'Volkswagen Gol 2019 - 1.0',
        description: 'Gol 1.0, econômico, perfeito para o dia a dia.',
        price: 45000,
        category: 'vehicle',
        type: 'car',
        dealType: 'Venda',
        location: { city: 'Rio de Janeiro', state: 'RJ', neighborhood: 'Copacabana' },
        images: ['https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1400&q=80'],
        details: { year: 2019, km: 48000, fuel: 'Flex', transmission: 'Manual', color: 'Vermelho', doors: 4 },
        contact: { name: user.name, phone: '(21) 97777-7777', whatsapp: '5521977777777' },
        status: 'active'
      },

      // Imóveis
      {
        user_id: user.id,
        title: 'Apartamento 3 Quartos - Centro',
        description: 'Apartamento 120m², 3 quartos, 2 vagas, pronto para morar.',
        price: 650000,
        category: 'property',
        type: 'apartment',
        dealType: 'Venda',
        location: { city: 'Curitiba', state: 'PR', neighborhood: 'Centro' },
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80'],
        details: { beds: 3, baths: 2, area: '120m²', parkingSpaces: 2 },
        contact: { name: user.name, phone: '(41) 99999-9999', whatsapp: '5541999999999' },
        status: 'active'
      },
      {
        user_id: user.id,
        title: 'Casa 4 Quartos com Piscina',
        description: 'Linda casa 250m², 4 quartos, piscina, churrasqueira.',
        price: 950000,
        category: 'property',
        type: 'house',
        dealType: 'Venda',
        location: { city: 'São Paulo', state: 'SP', neighborhood: 'Morumbi' },
        images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1400&q=80'],
        details: { beds: 4, baths: 3, area: '250m²', parkingSpaces: 4 },
        contact: { name: user.name, phone: '(11) 98888-8888', whatsapp: '5511988888888' },
        status: 'active'
      },
      {
        user_id: user.id,
        title: 'Kitnet Mobiliada - Centro',
        description: 'Kitnet 35m², mobiliada, próximo ao metrô.',
        price: 180000,
        category: 'property',
        type: 'apartment',
        dealType: 'Venda',
        location: { city: 'Belo Horizonte', state: 'MG', neighborhood: 'Savassi' },
        images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80'],
        details: { beds: 1, baths: 1, area: '35m²', parkingSpaces: 1 },
        contact: { name: user.name, phone: '(31) 96666-6666', whatsapp: '5531966666666' },
        status: 'active'
      },
    ];

    // Inserir novos anúncios SEM deletar os existentes
    const { data, error } = await supabase
      .from('listings')
      .insert(listings)
      .select();

    if (error) {
      console.error('❌ Erro ao criar anúncios:', error);
      return;
    }

    console.log(`✅ ${data.length} anúncios criados com sucesso!`);
    
    // Mostrar resumo
    const vehicles = data.filter(l => l.category === 'vehicle').length;
    const properties = data.filter(l => l.category === 'property').length;
    console.log(`   📦 Veículos: ${vehicles}`);
    console.log(`   🏠 Imóveis: ${properties}`);

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

populateListings();
