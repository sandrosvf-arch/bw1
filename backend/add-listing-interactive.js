// Script interativo para adicionar anúncios rapidamente
const readline = require('readline');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function addListing() {
  try {
    // Buscar usuários
    const { data: users } = await supabase.from('users').select('*').limit(10);
    
    console.log('\n📝 ADICIONAR NOVO ANÚNCIO\n');
    console.log('Usuários disponíveis:');
    users.forEach((u, i) => console.log(`${i + 1}. ${u.email} (${u.name})`));
    
    const userIndex = parseInt(await question('\nEscolha o usuário (número): ')) - 1;
    const user = users[userIndex];

    const category = await question('\nCategoria (vehicle/property): ');
    const title = await question('Título: ');
    const description = await question('Descrição: ');
    const price = parseFloat(await question('Preço (número): '));
    
    let type, details;
    
    if (category === 'vehicle') {
      type = await question('Tipo (car/motorcycle/truck): ');
      const year = await question('Ano: ');
      const km = await question('Km: ');
      const fuel = await question('Combustível (Gasolina/Flex/Diesel): ');
      const transmission = await question('Câmbio (Manual/Automático): ');
      const color = await question('Cor: ');
      
      details = {
        year: parseInt(year),
        km: parseInt(km),
        fuel,
        transmission,
        color,
        doors: 4
      };
    } else {
      type = await question('Tipo (apartment/house/land): ');
      const beds = await question('Quartos: ');
      const baths = await question('Banheiros: ');
      const area = await question('Área (m²): ');
      const parking = await question('Vagas de garagem: ');
      
      details = {
        beds: parseInt(beds),
        baths: parseInt(baths),
        area: `${area}m²`,
        parkingSpaces: parseInt(parking)
      };
    }

    const city = await question('Cidade: ');
    const state = await question('Estado (sigla): ');
    const neighborhood = await question('Bairro: ');
    const dealType = await question('Tipo de negócio (Venda/Aluguel): ');
    const imageUrl = await question('URL da imagem (ou deixe em branco para usar padrão): ');

    const listing = {
      user_id: user.id,
      title,
      description,
      price,
      category,
      type,
      dealType,
      location: { city, state, neighborhood },
      images: [imageUrl || 'https://images.unsplash.com/photo-1520440229-6469a149ac59?auto=format&fit=crop&w=1400&q=80'],
      details,
      contact: {
        name: user.name,
        phone: '(41) 99999-9999',
        whatsapp: '5541999999999',
        email: user.email
      },
      status: 'active'
    };

    const { data, error } = await supabase
      .from('listings')
      .insert(listing)
      .select()
      .single();

    if (error) {
      console.error('\n❌ Erro:', error);
    } else {
      console.log('\n✅ Anúncio criado com sucesso!');
      console.log(`   ID: ${data.id}`);
      console.log(`   Título: ${data.title}`);
    }

    const more = await question('\nAdicionar outro anúncio? (s/n): ');
    if (more.toLowerCase() === 's') {
      await addListing();
    } else {
      rl.close();
      console.log('\n👋 Concluído!');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
    rl.close();
  }
}

console.log('🚀 BW1 - Adicionar Anúncios Manualmente');
console.log('=====================================\n');
addListing();
