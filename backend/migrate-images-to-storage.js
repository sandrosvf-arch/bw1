/**
 * Script de migração: converte imagens base64 do banco para o Supabase Storage
 * Executar: node migrate-images-to-storage.js
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const BUCKET = 'listing-images';

async function ensureBucket() {
  const { error } = await supabaseAdmin.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  });
  if (error && !error.message.includes('already exists')) {
    throw new Error(`Erro ao criar bucket: ${error.message}`);
  }
  console.log(`✅ Bucket '${BUCKET}' pronto`);
}

async function base64ToBuffer(base64String) {
  // Remove o prefixo "data:image/...;base64,"
  const matches = base64String.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) return null;
  const mimeType = matches[1];
  const data = Buffer.from(matches[2], 'base64');
  return { buffer: data, mimeType };
}

async function uploadBase64Image(base64String, listingId, index) {
  const result = await base64ToBuffer(base64String);
  if (!result) return null;

  const { buffer, mimeType } = result;
  const ext = mimeType.split('/')[1].replace('jpeg', 'jpg');
  const filePath = `listings/${listingId}/${index}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(filePath, buffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) {
    console.error(`  ❌ Erro no upload ${filePath}:`, error.message);
    return null;
  }

  const { data: { publicUrl } } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filePath);
  return publicUrl;
}

async function migrateListing(listing) {
  let images;
  try {
    images = typeof listing.images === 'string' ? JSON.parse(listing.images) : listing.images;
  } catch {
    images = [];
  }

  if (!Array.isArray(images) || images.length === 0) return false;

  const base64Images = images.filter(img => typeof img === 'string' && img.startsWith('data:image/'));
  if (base64Images.length === 0) return false; // já são URLs ou não há imagens

  console.log(`\n📸 Migrando listing ${listing.id} (${listing.title}) — ${base64Images.length} imagem(ns) base64`);

  const newImages = [];
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    if (typeof img === 'string' && img.startsWith('data:image/')) {
      const url = await uploadBase64Image(img, listing.id, i);
      if (url) {
        console.log(`  ✅ Imagem ${i + 1} → ${url.substring(0, 80)}...`);
        newImages.push(url);
      } else {
        // Manter a original se falhar
        newImages.push(img);
      }
    } else {
      newImages.push(img); // URL normal, manter
    }
  }

  // Atualizar o banco com as novas URLs
  const { error } = await supabaseAdmin
    .from('listings')
    .update({ images: newImages })
    .eq('id', listing.id);

  if (error) {
    console.error(`  ❌ Erro ao atualizar listing ${listing.id}:`, error.message);
    return false;
  }

  console.log(`  ✅ Listing ${listing.id} atualizado com ${newImages.length} URL(s)`);
  return true;
}

async function main() {
  console.log('🚀 Iniciando migração de imagens base64 → Supabase Storage\n');

  await ensureBucket();

  let page = 0;
  const pageSize = 10;
  let totalMigrated = 0;
  let totalSkipped = 0;

  while (true) {
    const { data: listings, error } = await supabaseAdmin
      .from('listings')
      .select('id, title, images')
      .range(page * pageSize, (page + 1) * pageSize - 1)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar listings:', error.message);
      break;
    }

    if (!listings || listings.length === 0) break;

    console.log(`\n📄 Página ${page + 1}: ${listings.length} listings`);

    for (const listing of listings) {
      const migrated = await migrateListing(listing);
      if (migrated) {
        totalMigrated++;
      } else {
        totalSkipped++;
      }
    }

    if (listings.length < pageSize) break;
    page++;
  }

  console.log(`\n✅ Migração concluída!`);
  console.log(`   ${totalMigrated} listing(s) migrado(s)`);
  console.log(`   ${totalSkipped} listing(s) ignorado(s) (sem base64)`);
}

main().catch(err => {
  console.error('❌ Falha na migração:', err);
  process.exit(1);
});
