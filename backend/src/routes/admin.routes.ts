import { Router } from 'express';
import multer from 'multer';
import { supabaseAdmin } from '../config/supabase';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { masterMiddleware, BOOTSTRAP_MASTER } from '../middleware/master.middleware';
import { Response } from 'express';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// ─── SQL para criar as tabelas (para exibir no painel se necessário) ────────
export const SETUP_SQL = `
-- Execute no Supabase Dashboard > SQL Editor
CREATE TABLE IF NOT EXISTS master_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  added_by text,
  created_at timestamptz DEFAULT now()
);
INSERT INTO master_users (email, added_by)
  VALUES ('${BOOTSTRAP_MASTER}', 'system')
  ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS banners (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  desktop_url text NOT NULL,
  mobile_url text NOT NULL,
  alt text DEFAULT '',
  link text DEFAULT '',
  order_index int DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Bucket público de banners (rodar uma vez)
-- Acesse Storage no Supabase Dashboard e crie o bucket "banners" como público.
`;

// Helper: faz upload de um buffer para Supabase Storage
async function uploadToStorage(buffer: Buffer, path: string, mimetype: string): Promise<string> {
  // Garante que o bucket exista
  await supabaseAdmin.storage.createBucket('banners', { public: true }).catch(() => {});

  const { error } = await supabaseAdmin.storage
    .from('banners')
    .upload(path, buffer, { contentType: mimetype, upsert: true });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabaseAdmin.storage.from('banners').getPublicUrl(path);
  return data.publicUrl;
}

// ─── CHECK: é mestre? ────────────────────────────────────────────────────────
router.get('/is-master', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const email = req.userEmail;
    if (!email) return res.json({ isMaster: false });

    if (email === BOOTSTRAP_MASTER) return res.json({ isMaster: true });

    const { data } = await supabaseAdmin
      .from('master_users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    res.json({ isMaster: !!data });
  } catch {
    res.json({ isMaster: false });
  }
});

// ─── SETUP SQL ───────────────────────────────────────────────────────────────
router.get('/setup-sql', authMiddleware, masterMiddleware, (_req, res: Response) => {
  res.json({ sql: SETUP_SQL });
});

// ═══════════════════════════════════════════════════════════════════
//  BANNERS
// ═══════════════════════════════════════════════════════════════════

// Listar banners ativos (público — usado pelo Hero)
router.get('/banners/public', async (_req, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('banners')
      .select('*')
      .eq('active', true)
      .order('order_index', { ascending: true });

    if (error) throw error;
    res.json({ banners: data || [] });
  } catch (err: any) {
    res.status(503).json({ error: err.message, setupRequired: true });
  }
});

// Listar todos os banners (admin)
router.get('/banners', authMiddleware, masterMiddleware, async (_req, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('banners')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) throw error;
    res.json({ banners: data || [] });
  } catch (err: any) {
    res.status(503).json({ error: err.message, setupRequired: true });
  }
});

// Criar banner com upload de imagens
router.post(
  '/banners',
  authMiddleware,
  masterMiddleware,
  upload.fields([{ name: 'desktop', maxCount: 1 }, { name: 'mobile', maxCount: 1 }]),
  async (req: AuthRequest, res: Response) => {
    try {
      const files = req.files as { [k: string]: Express.Multer.File[] } | undefined;
      const { alt = '', link = '', order_index = 0, active = true } = req.body;

      if (!files?.desktop?.[0] || !files?.mobile?.[0]) {
        return res.status(400).json({ error: 'Envie as imagens desktop e mobile' });
      }

      const ts = Date.now();
      const desktopUrl = await uploadToStorage(
        files.desktop[0].buffer,
        `desktop-${ts}.${files.desktop[0].originalname.split('.').pop()}`,
        files.desktop[0].mimetype
      );
      const mobileUrl = await uploadToStorage(
        files.mobile[0].buffer,
        `mobile-${ts}.${files.mobile[0].originalname.split('.').pop()}`,
        files.mobile[0].mimetype
      );

      const { data, error } = await supabaseAdmin
        .from('banners')
        .insert({ desktop_url: desktopUrl, mobile_url: mobileUrl, alt, link, order_index: Number(order_index), active: active !== 'false' })
        .select()
        .single();

      if (error) throw error;
      res.status(201).json({ banner: data });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Atualizar banner (metadados ou trocar imagens)
router.put(
  '/banners/:id',
  authMiddleware,
  masterMiddleware,
  upload.fields([{ name: 'desktop', maxCount: 1 }, { name: 'mobile', maxCount: 1 }]),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const files = req.files as { [k: string]: Express.Multer.File[] } | undefined;
      const updates: Record<string, any> = {};

      if (req.body.alt !== undefined) updates.alt = req.body.alt;
      if (req.body.link !== undefined) updates.link = req.body.link;
      if (req.body.order_index !== undefined) updates.order_index = Number(req.body.order_index);
      if (req.body.active !== undefined) updates.active = req.body.active !== 'false';

      const ts = Date.now();
      if (files?.desktop?.[0]) {
        updates.desktop_url = await uploadToStorage(
          files.desktop[0].buffer,
          `desktop-${ts}.${files.desktop[0].originalname.split('.').pop()}`,
          files.desktop[0].mimetype
        );
      }
      if (files?.mobile?.[0]) {
        updates.mobile_url = await uploadToStorage(
          files.mobile[0].buffer,
          `mobile-${ts}.${files.mobile[0].originalname.split('.').pop()}`,
          files.mobile[0].mimetype
        );
      }

      const { data, error } = await supabaseAdmin
        .from('banners')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      res.json({ banner: data });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Deletar banner
router.delete('/banners/:id', authMiddleware, masterMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { error } = await supabaseAdmin.from('banners').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
//  USUÁRIOS MESTRES
// ═══════════════════════════════════════════════════════════════════

// Listar mestres
router.get('/masters', authMiddleware, masterMiddleware, async (_req, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('master_users')
      .select('id, email, added_by, created_at')
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Sempre inclui o bootstrap master mesmo que não esteja na tabela
    const list = data || [];
    if (!list.find((u) => u.email === BOOTSTRAP_MASTER)) {
      list.unshift({ id: 'bootstrap', email: BOOTSTRAP_MASTER, added_by: 'system', created_at: null });
    }

    res.json({ masters: list });
  } catch (err: any) {
    res.status(503).json({ error: err.message, setupRequired: true });
  }
});

// Adicionar mestre
router.post('/masters', authMiddleware, masterMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'E-mail inválido' });
    }

    const { data, error } = await supabaseAdmin
      .from('master_users')
      .insert({ email: email.toLowerCase().trim(), added_by: req.userEmail })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ master: data });
  } catch (err: any) {
    if (err.message?.includes('duplicate') || err.code === '23505') {
      return res.status(409).json({ error: 'Este e-mail já é mestre' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Remover mestre
router.delete('/masters/:email', authMiddleware, masterMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const email = decodeURIComponent(req.params.email);
    if (email === BOOTSTRAP_MASTER) {
      return res.status(400).json({ error: 'Não é possível remover o mestre raiz' });
    }

    const { error } = await supabaseAdmin.from('master_users').delete().eq('email', email);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
