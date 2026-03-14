import { supabaseAdmin } from '../config/supabase';

/**
 * Intervalos de auto-bump por plano (em milissegundos)
 * Standard: 35 dias / 3 bumps  → a cada ~11 dias
 * Pro:      60 dias / 5 bumps  → a cada ~12 dias
 * Premium:  ilimitado          → a cada 7 dias
 */
const BUMP_INTERVALS_MS: Record<string, number> = {
  standard: 11 * 24 * 60 * 60 * 1000,
  pro:      12 * 24 * 60 * 60 * 1000,
  premium:   7 * 24 * 60 * 60 * 1000,
};

async function runAutoBump() {
  try {
    // Busca todos os anúncios ativos com planos pagos
    const { data: listings, error } = await supabaseAdmin
      .from('listings')
      .select('id, plan, bumped_at, bumps_remaining')
      .eq('status', 'active')
      .eq('featured', true)
      .in('plan', ['standard', 'pro', 'premium']);

    // Se der erro (ex: coluna inexistente) apenas sai sem logar
    if (error) return;
    if (!listings || listings.length === 0) return;

    const now = Date.now();
    let bumped = 0;

    for (const listing of listings) {
      const interval = BUMP_INTERVALS_MS[listing.plan];
      if (!interval) continue;

      const isPremium = listing.plan === 'premium';

      // Se não tem bumps restantes (e não é premium), pula
      if (!isPremium && (!listing.bumps_remaining || listing.bumps_remaining <= 0)) continue;

      // Verifica se já passou o intervalo desde o último bump
      const lastBump = listing.bumped_at ? new Date(listing.bumped_at).getTime() : 0;
      if (now - lastBump < interval) continue;

      // Aplica o bump
      const newBumpsRemaining = isPremium ? 99 : listing.bumps_remaining - 1;

      const { error: updateErr } = await supabaseAdmin
        .from('listings')
        .update({
          bumped_at: new Date().toISOString(),
          bumps_remaining: newBumpsRemaining,
        })
        .eq('id', listing.id);

      if (!updateErr) {
        bumped++;
        console.log(`[AutoBump] ✅ ${listing.plan.toUpperCase()} ${listing.id} voltou ao topo`);
      }
    }

    if (bumped > 0) {
      console.log(`[AutoBump] ${bumped} anúncio(s) re-indexado(s) automaticamente`);
    }
  } catch (err) {
    // Silencioso enquanto colunas não existem
  }
}

const INTERVAL_MS = 60 * 60 * 1000; // 1 hora

export function startAutoBumpService() {
  console.log('⏱️  Auto-bump service iniciado (verifica a cada hora)');
  runAutoBump(); // roda imediatamente
  setInterval(runAutoBump, INTERVAL_MS);
}


