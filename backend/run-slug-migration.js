/**
 * Migra o banco para adicionar a coluna slug.
 * Execute: node run-slug-migration.js  (dentro de backend/)
 */
require('dotenv').config();

const sql = `
ALTER TABLE listings ADD COLUMN IF NOT EXISTS slug TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS listings_slug_unique ON listings(slug) WHERE slug IS NOT NULL;
`;

async function tryEndpoint(url, body) {
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  return { status: r.status, text };
}

async function main() {
  const base = process.env.SUPABASE_URL;

  console.log('Tentando /sql...');
  let res = await tryEndpoint(base + '/sql', { query: sql });
  console.log('/sql ->', res.status, res.text.slice(0, 300));

  if (res.status === 200 || res.status === 204) {
    console.log('\n✅ Coluna slug criada! Agora execute: node populate-slugs.js');
    return;
  }

  console.log('\nTentando /rest/v1/rpc/query...');
  res = await tryEndpoint(base + '/rest/v1/rpc/query', { query: sql });
  console.log('/rpc/query ->', res.status, res.text.slice(0, 300));

  if (res.status === 200 || res.status === 204) {
    console.log('\n✅ Coluna slug criada! Agora execute: node populate-slugs.js');
    return;
  }

  console.log('\n❌ Não foi possível executar automaticamente.');
  console.log('Execute manualmente no Supabase SQL Editor:');
  console.log(sql);
}

main().catch(console.error);
