// Script para verificar anúncios no banco
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkListings() {
  try {
    // Buscar TODOS os anúncios
    const { data: allListings, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar anúncios:', error);
      return;
    }

    console.log(`\n📊 Total de anúncios: ${allListings?.length || 0}\n`);

    if (!allListings || allListings.length === 0) {
      console.log('⚠️  Nenhum anúncio encontrado no banco!');
      return;
    }

    // Agrupar por status
    const byStatus = {};
    allListings.forEach(listing => {
      const status = listing.status || 'undefined';
      byStatus[status] = (byStatus[status] || 0) + 1;
    });

    console.log('📋 Por Status:');
    Object.entries(byStatus).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    // Agrupar por category
    const byCategory = {};
    allListings.forEach(listing => {
      const category = listing.category || 'undefined';
      byCategory[category] = (byCategory[category] || 0) + 1;
    });

    console.log('\n📋 Por Category:');
    Object.entries(byCategory).forEach(([category, count]) => {
      console.log(`   ${category}: ${count}`);
    });

    // Agrupar por type
    const byType = {};
    allListings.forEach(listing => {
      const type = listing.type || 'undefined';
      byType[type] = (byType[type] || 0) + 1;
    });

    console.log('\n📋 Por Type:');
    Object.entries(byType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

    // Mostrar alguns exemplos
    console.log('\n📝 Exemplos de anúncios:');
    allListings.slice(0, 5).forEach(listing => {
      console.log(`\n   ID: ${listing.id}`);
      console.log(`   Título: ${listing.title}`);
      console.log(`   Category: ${listing.category}`);
      console.log(`   Type: ${listing.type}`);
      console.log(`   Status: ${listing.status}`);
      console.log(`   Preço: ${listing.price}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

checkListings();
