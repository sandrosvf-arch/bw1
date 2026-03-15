/**
 * Gera slugs para todos os anúncios que ainda não têm slug.
 * Execute: node populate-slugs.js  (dentro de backend/)
 *
 * Pré-requisito: rodar add-slug-column.sql no Supabase primeiro.
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Converte um título em slug URL-safe.
 * Ex: "Honda Civic EXL CVT Completo" → "honda-civic-exl-cvt-completo"
 */
function titleToSlug(title) {
  return String(title || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')      // remove chars especiais
    .trim()
    .replace(/\s+/g, '-')              // espaços → hífens
    .replace(/-+/g, '-')               // colapsa hífens duplos
    .substring(0, 80)                  // limite de comprimento
    .replace(/-$/, '');                // remove hífen final
}

async function main() {
  console.log('🔍 Buscando anúncios sem slug...');

  const { data: listings, error } = await sb
    .from('listings')
    .select('id, title, slug')
    .is('slug', null);

  if (error) {
    console.error('Erro ao buscar listings:', error.message);
    process.exit(1);
  }

  console.log(`📋 ${listings.length} anúncio(s) sem slug encontrado(s).`);

  // Busca todos os slugs já existentes para garantir unicidade
  const { data: existing } = await sb.from('listings').select('slug').not('slug', 'is', null);
  const usedSlugs = new Set((existing || []).map(r => r.slug));

  let updated = 0;
  let skipped = 0;

  for (const listing of listings) {
    if (!listing.title) { skipped++; continue; }

    let base = titleToSlug(listing.title);
    if (!base) { skipped++; continue; }

    // Garante unicidade adicionando sufixo numérico se necessário
    let slug = base;
    let attempt = 2;
    while (usedSlugs.has(slug)) {
      slug = `${base}-${attempt++}`;
    }
    usedSlugs.add(slug);

    const { error: updateErr } = await sb
      .from('listings')
      .update({ slug })
      .eq('id', listing.id);

    if (updateErr) {
      console.warn(`  ⚠️  Falha ao atualizar ${listing.id}: ${updateErr.message}`);
      skipped++;
    } else {
      console.log(`  ✅ ${listing.id} → /${slug}`);
      updated++;
    }
  }

  console.log(`\n🎉 Concluído: ${updated} atualizados, ${skipped} ignorados.`);
}

main().catch(err => {
  console.error('Erro inesperado:', err);
  process.exit(1);
});
