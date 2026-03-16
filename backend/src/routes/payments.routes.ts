import { Router } from 'express';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { supabaseAdmin } from '../config/supabase';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

const PLANS: Record<string, { amount: number; label: string; days: number | null }> = {
  // Standard R$19 | PRO R$39 | Premium R$79
  standard: { amount: 19, label: 'Destaque Standard - BW1', days: 35 },
  pro:      { amount: 39, label: 'Destaque PRO - BW1',      days: 60 },
  premium:  { amount: 79, label: 'Super Destaque Premium - BW1', days: null }, // sem expiração
};

function getMPClient() {
  return new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
  });
}

// POST /api/payments/create
// Cria um pagamento PIX para o plano escolhido
router.post('/create', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { listingId, plan, payerEmail } = req.body;

    if (!listingId || !plan) {
      return res.status(400).json({ error: 'listingId e plan são obrigatórios' });
    }

    const selectedPlan = PLANS[plan];
    if (!selectedPlan) {
      return res.status(400).json({ error: 'Plano inválido' });
    }

    // Verifica se o anúncio pertence ao usuário
    const { data: listing } = await supabaseAdmin
      .from('listings')
      .select('id, user_id')
      .eq('id', listingId)
      .single();

    if (!listing || listing.user_id !== req.userId) {
      return res.status(403).json({ error: 'Anúncio não encontrado ou sem permissão' });
    }

    const payment = new Payment(getMPClient());

    const result = await payment.create({
      body: {
        transaction_amount: selectedPlan.amount,
        description: selectedPlan.label,
        payment_method_id: 'pix',
        payer: {
          email: payerEmail || 'pagamento@bw1app.com.br',
        },
        metadata: {
          listing_id: listingId,
          plan,
          user_id: req.userId,
        },
        notification_url: `${process.env.BACKEND_URL || 'https://bw1-backend-g2vf.onrender.com'}/api/payments/webhook`,
        date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
      },
    });

    const mpId = String(result.id);
    const qrCode = result.point_of_interaction?.transaction_data?.qr_code || '';
    const qrCodeBase64 = result.point_of_interaction?.transaction_data?.qr_code_base64 || '';

    // Salva no banco
    await supabaseAdmin.from('payments').insert({
      id: mpId,
      listing_id: listingId,
      user_id: req.userId,
      plan,
      amount: selectedPlan.amount,
      status: 'pending',
      mp_payment_id: mpId,
      qr_code: qrCode,
      qr_code_base64: qrCodeBase64,
    });

    return res.json({
      paymentId: mpId,
      qrCode,
      qrCodeBase64,
      amount: selectedPlan.amount,
      plan,
      listingId,
    });
  } catch (error: any) {
    console.error('Erro ao criar pagamento:', error);
    return res.status(500).json({ error: 'Erro ao criar pagamento PIX', detail: error?.message });
  }
});

// GET /api/payments/:paymentId/status
// Consulta status do pagamento — verifica diretamente no MP como fallback
router.get('/:paymentId/status', async (req, res) => {
  try {
    const { paymentId } = req.params;

    const { data } = await supabaseAdmin
      .from('payments')
      .select('status, plan, listing_id, amount, qr_code, qr_code_base64')
      .eq('mp_payment_id', paymentId)
      .single();

    if (!data) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    // Se ainda pending, consulta direto no MP para garantir atualização em tempo real
    if (data.status === 'pending') {
      try {
        const payment = new Payment(getMPClient());
        const result = await payment.get({ id: Number(paymentId) });

        console.log(`[MP STATUS] paymentId=${paymentId} → status=${result.status}`);

        if (result.status === 'approved') {
          const plan = result.metadata?.plan || data.plan;
          const listingId = result.metadata?.listing_id || data.listing_id;
          const planConfig = PLANS[plan];
          const expiresAt = planConfig?.days
            ? new Date(Date.now() + planConfig.days * 24 * 60 * 60 * 1000).toISOString()
            : null;

          await supabaseAdmin
            .from('payments')
            .update({ status: 'approved', paid_at: new Date().toISOString() })
            .eq('mp_payment_id', paymentId);

          await supabaseAdmin
            .from('listings')
            .update({ plan, plan_expires_at: expiresAt, featured: true, bumped_at: new Date().toISOString() })
            .eq('id', listingId);

          return res.json({
            status: 'approved',
            plan: data.plan,
            listingId: data.listing_id,
            amount: data.amount,
          });
        } else if (result.status === 'rejected' || result.status === 'cancelled') {
          await supabaseAdmin
            .from('payments')
            .update({ status: result.status })
            .eq('mp_payment_id', paymentId);

          return res.json({ status: result.status, plan: data.plan, listingId: data.listing_id, amount: data.amount });
        }
      } catch (mpErr: any) {
        console.error('Falha ao consultar MP diretamente:', mpErr?.message || mpErr);
      }
    }

    return res.json({
      status: data.status,
      plan: data.plan,
      listingId: data.listing_id,
      amount: data.amount,
      qrCode: data.qr_code,
      qrCodeBase64: data.qr_code_base64,
    });
  } catch (error) {
    console.error('Erro ao consultar status:', error);
    return res.status(500).json({ error: 'Erro ao consultar pagamento' });
  }
});

// POST /api/payments/webhook
// Recebe notificações do Mercado Pago
router.post('/webhook', async (req, res) => {
  // Sempre responde 200 primeiro para o MP não reenviar
  res.sendStatus(200);

  const { type, data } = req.body;
  if (type !== 'payment' || !data?.id) return;

  try {
    const payment = new Payment(getMPClient());
    const result = await payment.get({ id: data.id });

    console.log(`💰 Webhook MP: payment ${data.id} status=${result.status}`);

    if (result.status === 'approved') {
      const listingId = result.metadata?.listing_id;
      const plan = result.metadata?.plan;

      if (!listingId || !plan) return;

      const planConfig = PLANS[plan];
      if (!planConfig) return;

      const expiresAt = planConfig.days
        ? new Date(Date.now() + planConfig.days * 24 * 60 * 60 * 1000).toISOString()
        : null;

      // Atualiza pagamento
      await supabaseAdmin
        .from('payments')
        .update({ status: 'approved', paid_at: new Date().toISOString() })
        .eq('mp_payment_id', String(data.id));

      // Atualiza anúncio — seta bumped_at para iniciar o contador do boost imediatamente
      await supabaseAdmin
        .from('listings')
        .update({
          plan,
          plan_expires_at: expiresAt,
          featured: true,
          bumped_at: new Date().toISOString(),
        })
        .eq('id', listingId);

      console.log(`✅ Anúncio ${listingId} atualizado para plano ${plan}`);
    } else if (result.status === 'rejected' || result.status === 'cancelled') {
      await supabaseAdmin
        .from('payments')
        .update({ status: result.status })
        .eq('mp_payment_id', String(data.id));
    }
  } catch (err) {
    console.error('Erro no webhook MP:', err);
  }
});

export default router;
