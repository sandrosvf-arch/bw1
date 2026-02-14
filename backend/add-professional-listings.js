// Adicionar anúncios profissionais variados ao banco (SEM deletar existentes)
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addProfessionalListings() {
  try {
    const { data: users } = await supabase.from('users').select('*').limit(1);
    if (!users || users.length === 0) {
      console.log('❌ Nenhum usuário encontrado!');
      return;
    }

    const user = users[0];

    const listings = [
      // Veículos variados
      {
        user_id: user.id,
        title: 'Fiat Argo 2022 - 1.3 Flex',
        description: 'Fiat Argo Drive 1.3, completo, km baixa, único dono, manual de serviço em dia.',
        price: 62000,
        category: 'vehicle',
        type: 'car',
        dealType: 'Venda',
        location: { city: 'Porto Alegre', state: 'RS', neighborhood: 'Menino Deus' },
        images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1400&q=80'],
        details: { year: 2022, km: 18000, fuel: 'Flex', transmission: 'Manual', color: 'Branco', doors: 4 },
        contact: { name: user.name, phone: '(51) 99999-9999', whatsapp: '5551999999999', email: user.email },
        status: 'active'
      },
      {
        user_id: user.id,
        title: 'Jeep Compass 2021 - Diesel 4x4',
        description: 'Jeep Compass Limited diesel, 4x4, teto solar, couro, 7 airbags, revisões na concessionária.',
        price: 165000,
        category: 'vehicle',
        type: 'car',
        dealType: 'Venda',
        location: { city: 'Florianópolis', state: 'SC', neighborhood: 'Trindade' },
        images: ['https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1400&q=80'],
        details: { year: 2021, km: 42000, fuel: 'Diesel', transmission: 'Automático', color: 'Preto', doors: 4 },
        contact: { name: user.name, phone: '(48) 98888-8888', whatsapp: '5548988888888', email: user.email },
        status: 'active'
      },
      {
        user_id: user.id,
        title: 'Volkswagen T-Cross 2023 - Sense',
        description: 'T-Cross Sense 2023, automático, central multimídia, câmera de ré, garantia de fábrica.',
        price: 105000,
        category: 'vehicle',
        type: 'car',
        dealType: 'Venda',
        location: { city: 'Brasília', state: 'DF', neighborhood: 'Asa Sul' },
        images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1400&q=80'],
        details: { year: 2023, km: 8500, fuel: 'Flex', transmission: 'Automático', color: 'Prata', doors: 4 },
        contact: { name: user.name, phone: '(61) 97777-7777', whatsapp: '5561977777777', email: user.email },
        status: 'active'
      },
      {
        user_id: user.id,
        title: 'Honda CB 500X 2020',
        description: 'Moto Honda CB 500X, perfeita para viagem, baús laterais, protetor de motor, manual.',
        price: 32000,
        category: 'vehicle',
        type: 'motorcycle',
        dealType: 'Venda',
        location: { city: 'Curitiba', state: 'PR', neighborhood: 'Água Verde' },
        images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1400&q=80'],
        details: { year: 2020, km: 15000, fuel: 'Gasolina', transmission: 'Manual', color: 'Vermelho', doors: 0 },
        contact: { name: user.name, phone: '(41) 99999-9999', whatsapp: '5541999999999', email: user.email },
        status: 'active'
      },

      // Imóveis variados
      {
        user_id: user.id,
        title: 'Studio - Centro Histórico',
        description: 'Studio moderno 40m², mobiliado, próximo ao metrô, condomínio completo.',
        price: 280000,
        category: 'property',
        type: 'apartment',
        dealType: 'Venda',
        location: { city: 'Salvador', state: 'BA', neighborhood: 'Pelourinho' },
        images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=80'],
        details: { beds: 1, baths: 1, area: '40m²', parkingSpaces: 1 },
        contact: { name: user.name, phone: '(71) 96666-6666', whatsapp: '5571966666666', email: user.email },
        status: 'active'
      },
      {
        user_id: user.id,
        title: 'Cobertura Duplex - Vista Mar',
        description: 'Cobertura 220m², 4 suítes, piscina privativa, churrasqueira, vista panorâmica.',
        price: 1850000,
        category: 'property',
        type: 'apartment',
        dealType: 'Venda',
        location: { city: 'Balneário Camboriú', state: 'SC', neighborhood: 'Centro' },
        images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80'],
        details: { beds: 4, baths: 5, area: '220m²', parkingSpaces: 3 },
        contact: { name: user.name, phone: '(47) 98888-8888', whatsapp: '5547988888888', email: user.email },
        status: 'active'
      },
      {
        user_id: user.id,
        title: 'Chácara 5000m² - com Casa',
        description: 'Chácara 5000m², casa 150m², pomar, lago, área de lazer completa, poço artesiano.',
        price: 580000,
        category: 'property',
        type: 'land',
        dealType: 'Venda',
        location: { city: 'Campinas', state: 'SP', neighborhood: 'Joaquim Egídio' },
        images: ['https://images.unsplash.com/photo-1605146769289-440113cc3d00?auto=format&fit=crop&w=1400&q=80'],
        details: { beds: 3, baths: 2, area: '5000m²', parkingSpaces: 5 },
        contact: { name: user.name, phone: '(19) 97777-7777', whatsapp: '5519977777777', email: user.email },
        status: 'active'
      },
      {
        user_id: user.id,
        title: 'Apartamento 2 Quartos - Aluguel',
        description: 'Apto 2 quartos, 65m², vaga coberta, próximo a universidades e comércio.',
        price: 1800,
        category: 'property',
        type: 'apartment',
        dealType: 'Aluguel',
        location: { city: 'Belo Horizonte', state: 'MG', neighborhood: 'Pampulha' },
        images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1400&q=80'],
        details: { beds: 2, baths: 1, area: '65m²', parkingSpaces: 1 },
        contact: { name: user.name, phone: '(31) 96666-6666', whatsapp: '5531966666666', email: user.email },
        status: 'active'
      },
    ];

    console.log('📦 Adicionando anúncios profissionais...\n');

    for (const listing of listings) {
      const { error } = await supabase.from('listings').insert(listing);
      if (error) {
        console.log(`❌ Erro ao adicionar: ${listing.title}`);
        console.error(error);
      } else {
        console.log(`✅ Adicionado: ${listing.title}`);
      }
    }

    console.log(`\n✅ ${listings.length} anúncios adicionados com sucesso!`);

    // Checar total
    const { data, error } = await supabase.from('listings').select('*', { count: 'exact' });
    if (!error) {
      console.log(`📊 Total de anúncios no banco: ${data.length}`);
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

addProfessionalListings();
