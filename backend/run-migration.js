require('dotenv').config();

const sql = `
ALTER TABLE listings ADD COLUMN IF NOT EXISTS bumped_at TIMESTAMPTZ;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS bumps_remaining INTEGER DEFAULT 0;
UPDATE listings SET bumps_remaining = CASE WHEN plan = 'standard' THEN 3 WHEN plan = 'pro' THEN 5 WHEN plan = 'premium' THEN 99 ELSE 0 END WHERE plan IS NOT NULL AND plan != 'basic';
CREATE INDEX IF NOT EXISTS idx_listings_featured_bumped ON listings (featured DESC, bumped_at DESC NULLS LAST, created_at DESC);
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

  // Tentativa 1: /sql (endpoint moderno)
  console.log('Tentando /sql...');
  let res = await tryEndpoint(base + '/sql', { query: sql });
  console.log(`/sql → ${res.status}: ${res.text.slice(0, 200)}`);

  if (res.status === 200 || res.status === 204) {
    console.log('\n✅ Migration aplicada com sucesso!');
    return;
  }

  // Tentativa 2: /rest/v1/rpc/query
  console.log('\nTentando /rest/v1/rpc/query...');
  res = await tryEndpoint(base + '/rest/v1/rpc/query', { query: sql });
  console.log(`/rpc/query → ${res.status}: ${res.text.slice(0, 200)}`);

  console.log('\n❌ Nao foi possivel executar automaticamente.');
  console.log('Execute manualmente no Supabase SQL Editor:');
  console.log(sql);
}

main().catch(console.error);
