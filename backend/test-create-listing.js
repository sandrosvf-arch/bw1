// Script para testar criação de anúncio
// Execute com: node test-create-listing.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestListing() {
  try {
    // Primeiro, criar um usuário de teste (ou usar o que já existe)
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (!users || users.length === 0) {
      console.log('❌ Nenhum usuário encontrado. Faça login primeiro!');
      return;
    }

    const user = users[0];
    console.log('✅ Usuário encontrado:', user.email);

    // NÃO deletar anúncios existentes! Comentado para segurança
    // await supabase.from('listings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    // console.log('🗑️  Anúncios antigos removidos');

    // Criar anúncio de teste - Veículo
    const vehicleListing = {
      user_id: user.id,
      title: 'Honda Civic 2020 - Automático',
      description: 'Honda Civic EX 2020, motor 2.0, automático CVT, completo com couro, multimídia, câmera de ré, sensores. Único dono, revisões em dia, excelente estado de conservação.',
      price: 95000,
      category: 'vehicle',
      type: 'car',
      tag: 'Venda',
      location: {
        city: 'Curitiba',
        state: 'PR',
        neighborhood: 'Batel',
        address: 'Avenida do Batel'
      },
      images: [
        'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1583267746897-f33337bfb98c?auto=format&fit=crop&w=1400&q=80'
      ],
      details: {
        year: 2020,
        km: 35000,
        fuel: 'Gasolina',
        transmission: 'Automático',
        color: 'Prata',
        doors: 4,
        bodyType: 'Sedan'
      },
      contact: {
        name: user.name,
        phone: '(41) 99999-9999',
        email: user.email,
        whatsapp: '5541999999999'
      },
      status: 'active'
    };

    const { data: vehicle, error: vehicleError } = await supabase
      .from('listings')
      .insert(vehicleListing)
      .select()
      .single();

    if (vehicleError) {
      console.error('❌ Erro ao criar veículo:', vehicleError);
    } else {
      console.log('✅ Veículo criado:', vehicle.title);
    }

    // Criar anúncio de teste - Imóvel
    const propertyListing = {
      user_id: user.id,
      title: 'Apartamento 3 Quartos - Centro',
      description: 'Lindo apartamento de 120m² no centro de Curitiba. 3 quartos sendo 1 suíte, 2 banheiros, sala ampla, cozinha planejada, 2 vagas de garagem. Condomínio com piscina, academia e salão de festas.',
      price: 650000,
      category: 'property',
      type: 'apartment',
      tag: 'Venda',
      location: {
        city: 'Curitiba',
        state: 'PR',
        neighborhood: 'Centro',
        address: 'Rua XV de Novembro'
      },
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80'
      ],
      details: {
        bedrooms: 3,
        bathrooms: 2,
        area: 120,
        parkingSpaces: 2,
        floor: 8,
        furnished: false,
        acceptsPets: true
      },
      contact: {
        name: user.name,
        phone: '(41) 99999-9999',
        email: user.email,
        whatsapp: '5541999999999'
      },
      status: 'active'
    };

    const { data: property, error: propertyError } = await supabase
      .from('listings')
      .insert(propertyListing)
      .select()
      .single();

    if (propertyError) {
      console.error('❌ Erro ao criar imóvel:', propertyError);
    } else {
      console.log('✅ Imóvel criado:', property.title);
    }

    console.log('\n✅ Anúncios de teste criados com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

createTestListing();
