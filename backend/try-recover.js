// Script para tentar recuperar dados deletados através de logs do Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function tryRecover() {
  console.log('🔍 Tentando recuperar informações sobre anúncios deletados...\n');

  try {
    // Verificar se existe tabela de auditoria
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (!error && tables) {
      console.log('📋 Tabelas disponíveis:');
      tables.forEach(t => console.log(`   - ${t.table_name}`));
    }

    // Verificar se existe alguma tabela de histórico
    const tableNames = tables?.map(t => t.table_name) || [];
    const historyTables = tableNames.filter(name => 
      name.includes('history') || 
      name.includes('audit') || 
      name.includes('log')
    );

    if (historyTables.length > 0) {
      console.log('\n✅ Tabelas de histórico encontradas:');
      historyTables.forEach(t => console.log(`   - ${t}`));
    } else {
      console.log('\n❌ Nenhuma tabela de histórico/auditoria encontrada.');
    }

    // Verificar quantos usuários existem (para recriar anúncios)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .limit(10);

    if (users && users.length > 0) {
      console.log('\n👥 Usuários disponíveis para recriar anúncios:');
      users.forEach(u => console.log(`   - ${u.email} (${u.name})`));
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }

  console.log('\n📝 PRÓXIMOS PASSOS:');
  console.log('   1. Se você lembra dos anúncios, posso criar um script interativo');
  console.log('   2. Ou você pode recriá-los pela interface: http://localhost:5173/criar-anuncio');
  console.log('   3. Posso criar anúncios de exemplo profissionais para popular o sistema');
}

tryRecover();
