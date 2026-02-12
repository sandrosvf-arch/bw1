/**
 * Script para atualizar o campo dealType em anúncios existentes
 * Execute com: npx tsx update-dealtypes.ts
 */

import { supabase } from './src/config/supabase';

async function updateDealTypes() {
  console.log('🔄 Iniciando atualização de dealType...\n');

  try {
    // 1. Buscar todos os anúncios sem dealType
    const { data: listings, error: fetchError } = await supabase
      .from('listings')
      .select('id, title, type, dealType, tag')
      .or('dealType.is.null,dealType.eq.');

    if (fetchError) {
      console.error('❌ Erro ao buscar anúncios:', fetchError);
      return;
    }

    console.log(`📊 Encontrados ${listings?.length || 0} anúncios sem dealType\n`);

    if (!listings || listings.length === 0) {
      console.log('✅ Todos os anúncios já possuem dealType definido!');
      return;
    }

    // 2. Atualizar cada anúncio
    let updated = 0;
    let errors = 0;

    for (const listing of listings) {
      // Usar 'tag' se existir, senão usar 'Venda' como padrão
      const newDealType = listing.tag || 'Venda';

      const { error: updateError } = await supabase
        .from('listings')
        .update({ dealType: newDealType })
        .eq('id', listing.id);

      if (updateError) {
        console.error(`❌ Erro ao atualizar ${listing.id}:`, updateError);
        errors++;
      } else {
        console.log(`✅ Atualizado: ${listing.title} → ${newDealType}`);
        updated++;
      }
    }

    console.log('\n📊 Resumo:');
    console.log(`✅ Atualizados: ${updated}`);
    console.log(`❌ Erros: ${errors}`);
    console.log(`📈 Total processado: ${updated + errors}`);

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar
updateDealTypes()
  .then(() => {
    console.log('\n🎉 Script finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erro fatal:', error);
    process.exit(1);
  });
