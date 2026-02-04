import { Router } from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Listar conversas do usuário
router.get('/conversations', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        listings:listing_id (id, title, images, price),
        participants:conversation_participants (
          users:user_id (id, name, avatar, email)
        )
      `)
      .or(`user1_id.eq.${req.userId},user2_id.eq.${req.userId}`)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    res.json({ conversations: data || [] });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// Obter mensagens de uma conversa
router.get('/conversations/:id/messages', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Verificar se o usuário faz parte da conversa
    const { data: conversation } = await supabase
      .from('conversations')
      .select('user1_id, user2_id')
      .eq('id', id)
      .single();

    if (!conversation || 
        (conversation.user1_id !== req.userId && conversation.user2_id !== req.userId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        users:sender_id (id, name, avatar)
      `)
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json({ messages: data || [] });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Criar ou recuperar conversa
router.post('/conversations', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { listingId, receiverId } = req.body;

    if (!listingId || !receiverId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verificar se já existe conversa
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .eq('listing_id', listingId)
      .or(`and(user1_id.eq.${req.userId},user2_id.eq.${receiverId}),and(user1_id.eq.${receiverId},user2_id.eq.${req.userId})`)
      .single();

    if (existing) {
      return res.json({ conversation: existing });
    }

    // Criar nova conversa
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        listing_id: listingId,
        user1_id: req.userId,
        user2_id: receiverId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ conversation: data });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Enviar mensagem
router.post('/messages', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { conversationId, content } = req.body;

    if (!conversationId || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verificar se o usuário faz parte da conversa
    const { data: conversation } = await supabase
      .from('conversations')
      .select('user1_id, user2_id')
      .eq('id', conversationId)
      .single();

    if (!conversation || 
        (conversation.user1_id !== req.userId && conversation.user2_id !== req.userId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Criar mensagem
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: req.userId,
        content,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Atualizar timestamp da conversa
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    res.status(201).json({ message: data });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
