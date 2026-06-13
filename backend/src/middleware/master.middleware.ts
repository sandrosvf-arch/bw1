import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { supabaseAdmin } from '../config/supabase';

/** Email do usuário mestre raiz — sempre tem acesso, mesmo sem estar na tabela */
export const BOOTSTRAP_MASTER = 'sandrosvf@gmail.com';

export const masterMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = req.userEmail;
    if (!email) return res.status(403).json({ error: 'Acesso negado' });

    // Mestre raiz sempre passa
    if (email === BOOTSTRAP_MASTER) return next();

    const { data } = await supabaseAdmin
      .from('master_users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (!data) {
      return res.status(403).json({ error: 'Acesso negado. Apenas usuários mestres.' });
    }

    next();
  } catch {
    return res.status(403).json({ error: 'Acesso negado' });
  }
};
