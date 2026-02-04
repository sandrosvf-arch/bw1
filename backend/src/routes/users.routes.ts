import { Router } from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Obter perfil de um usuário (público)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('users')
      .select('id, name, avatar, created_at')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: data });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Atualizar perfil (autenticado)
router.put('/profile', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, phone, avatar } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({
        name,
        phone,
        avatar,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.userId)
      .select('id, email, name, phone, avatar')
      .single();

    if (error) throw error;

    res.json({ user: data });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Favoritos
router.get('/favorites', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        listings:listing_id (*)
      `)
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ favorites: data || [] });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to get favorites' });
  }
});

router.post('/favorites/:listingId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { listingId } = req.params;

    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: req.userId,
        listing_id: listingId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ favorite: data });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

router.delete('/favorites/:listingId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { listingId } = req.params;

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', req.userId)
      .eq('listing_id', listingId);

    if (error) throw error;

    res.json({ message: 'Favorite removed' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

export default router;
