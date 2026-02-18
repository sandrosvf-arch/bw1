import { Router } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// Buscar perfil público de um usuário
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  const startTime = Date.now();
  
  try {
    console.log('🔍 Buscando perfil:', userId);
    
    // Fazer as duas queries em paralelo para ser mais rápido
    const [userResult, listingsResult] = await Promise.all([
      supabase
        .from('users')
        .select('id, name, email, avatar, created_at')
        .eq('id', userId)
        .single(),
      supabase
        .from('listings')
        .select('id, title, price, images')
        .eq('user_id', userId)
        .eq('status', 'active')
        .limit(20)
    ]);

    const { data: user, error: userError } = userResult;
    const { data: listings, error: listingsError } = listingsResult;

    if (userError || !user) {
      console.error('Erro ao buscar usuário:', userError);
      return res.status(404).json({ error: 'User not found' });
    }

    if (userError || !user) {
      console.error('Erro ao buscar usuário:', userError);
      return res.status(404).json({ error: 'User not found' });
    }

    // Parse rápido de images
    const parsedListings = (listings || []).map(l => ({
      ...l,
      images: typeof l.images === 'string' ? JSON.parse(l.images) : l.images
    }));

    // Mascarar email
    const maskedEmail = user.email?.replace(/(.{3})(.*)(@)/, '$1***$3') || null;

    const response = {
      profile: {
        id: user.id,
        name: user.name,
        email: maskedEmail,
        avatar: user.avatar,
        created_at: user.created_at,
        auth_method: user.email?.includes('@gmail.com') ? 'Google' : 'Email',
        stats: {
          total_listings: parsedListings.length,
          account_age_days: Math.floor((Date.now() - new Date(user.created_at).getTime()) / 86400000),
          member_since: user.created_at,
        },
      },
      listings: parsedListings,
    };

    console.log(`✅ Resposta enviada em ${Date.now() - startTime}ms`);
    res.json(response);
  } catch (error: any) {
    console.error('❌ Erro:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

export default router;
