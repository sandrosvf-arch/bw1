require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Usando o user_id do Astra (seu usuário de teste)
const USER_ID = '3d79a0dc-a955-48a9-8a86-9ac76eb176f6';

const fakeListings = [
  {
    user_id: USER_ID,
    title: 'Toyota Corolla XEi 2023 - Zero Km',
    price: 148900.00,
    category: 'carro',
    type: 'vehicle',
    dealType: 'Venda',
    status: 'active',
    plan: 'standard',
    featured: true,
    location: { country: 'Brasil', state: 'SP', city: 'São Paulo' },
    images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80'],
    details: { year: 2023, km: 0, fuel: 'Flex', color: 'Branco', doors: 4, transmission: 'Automático', bodyType: 'Sedan' },
    contact: { whatsapp: '11999999001' },
  },
  {
    user_id: USER_ID,
    title: 'Apartamento 3 Quartos com Vista Mar',
    price: 850000.00,
    category: 'apartamento',
    type: 'property',
    dealType: 'Venda',
    status: 'active',
    plan: 'pro',
    featured: true,
    location: { country: 'Brasil', state: 'SC', city: 'Florianópolis' },
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'],
    details: { bedrooms: 3, bathrooms: 2, area: 120, parking: 2, floor: 8 },
    contact: { whatsapp: '48999999002' },
  },
  {
    user_id: USER_ID,
    title: 'BMW M3 Competition 2024 — Única no Brasil',
    price: 699000.00,
    category: 'carro',
    type: 'vehicle',
    dealType: 'Venda',
    status: 'active',
    plan: 'premium',
    featured: true,
    location: { country: 'Brasil', state: 'RJ', city: 'Rio de Janeiro' },
    images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80'],
    details: { year: 2024, km: 5000, fuel: 'Gasolina', color: 'Azul Sanmarino', doors: 4, transmission: 'Automático', bodyType: 'Sedan' },
    contact: { whatsapp: '21999999003' },
  },
];

async function main() {
  for (const listing of fakeListings) {
    const { data, error } = await sb.from('listings').insert(listing).select('id,title,plan').single();
    if (error) {
      console.error(`❌ Erro ao criar "${listing.title}":`, error.message);
    } else {
      console.log(`✅ Criado [${data.plan.toUpperCase()}] "${data.title}" — id: ${data.id}`);
    }
  }
  console.log('\nPronto!');
}

main();
