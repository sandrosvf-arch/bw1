import { Router } from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import CacheService from '../services/cache.service';

const router = Router();

function parseJsonField(value: any) {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

// Listar conversas do usuário
router.get('/conversations', authMiddleware, async (req: AuthRequest, res) => {
  try {
    // Tentar buscar do cache
    const cachedConversations = CacheService.getConversations(req.userId!);
    if (cachedConversations) {
      return res.json(cachedConversations);
    }

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`user1_id.eq.${req.userId},user2_id.eq.${req.userId}`)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    const conversations = data || [];
    const listingIds = [...new Set(conversations.map((c) => c.listing_id).filter(Boolean))];
    const otherUserIds = [
      ...new Set(
        conversations
          .map((c) => (String(c.user1_id) === String(req.userId) ? c.user2_id : c.user1_id))
          .filter(Boolean)
      ),
    ];

    const [listingsResult, usersResult] = await Promise.all([
      listingIds.length
        ? supabase
            .from('listings')
            .select('id, title, images, price, user_id')
            .in('id', listingIds)
        : Promise.resolve({ data: [], error: null } as any),
      otherUserIds.length
        ? supabase
            .from('users')
            .select('id, name, avatar, email')
            .in('id', otherUserIds)
        : Promise.resolve({ data: [], error: null } as any),
    ]);

    if (listingsResult.error) throw listingsResult.error;
    if (usersResult.error) throw usersResult.error;

    const listingsMap = new Map(
      (listingsResult.data || []).map((listing: any) => [
        String(listing.id),
        {
          ...listing,
          images: parseJsonField(listing.images),
        },
      ])
    );

    const usersMap = new Map(
      (usersResult.data || []).map((user: any) => [String(user.id), user])
    );

    const enriched = conversations.map((conversation: any) => {
      const otherUserId = String(conversation.user1_id) === String(req.userId)
        ? conversation.user2_id
        : conversation.user1_id;

      return {
        ...conversation,
        listings: listingsMap.get(String(conversation.listing_id)) || null,
        other_user: usersMap.get(String(otherUserId)) || null,
      };
    });

    const response = { conversations: enriched };

    // Salvar no cache
    CacheService.setConversations(req.userId!, response);

    res.json(response);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// Obter uma conversa específica
router.get('/conversations/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (data.user1_id !== req.userId && data.user2_id !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const otherUserId = String(data.user1_id) === String(req.userId)
      ? data.user2_id
      : data.user1_id;

    const [listingResult, userResult] = await Promise.all([
      supabase
        .from('listings')
        .select('id, title, images, price, user_id')
        .eq('id', data.listing_id)
        .maybeSingle(),
      supabase
        .from('users')
        .select('id, name, avatar, email')
        .eq('id', otherUserId)
        .maybeSingle(),
    ]);

    if (listingResult.error) throw listingResult.error;
    if (userResult.error) throw userResult.error;

    const listing = listingResult.data
      ? {
          ...listingResult.data,
          images: parseJsonField(listingResult.data.images),
        }
      : null;

    res.json({
      conversation: {
        ...data,
        listings: listing,
        other_user: userResult.data || null,
      },
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

// Obter mensagens de uma conversa
router.get('/conversations/:id/messages', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Tentar buscar do cache
    const cachedMessages = CacheService.getMessages(id);
    if (cachedMessages) {
      return res.json(cachedMessages);
    }

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

    const response = { messages: data || [] };

    // Salvar no cache
    CacheService.setMessages(id, response);

    res.json(response);
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

    // Verificar se já existe conversa entre esses usuários para esse anúncio
    const { data: existing, error: existingError } = await supabase
      .from('conversations')
      .select('*')
      .eq('listing_id', listingId)
      .or(`and(user1_id.eq.${req.userId},user2_id.eq.${receiverId}),and(user1_id.eq.${receiverId},user2_id.eq.${req.userId})`)
      .maybeSingle();

    if (existingError && existingError.code !== 'PGRST116') {
      throw existingError;
    }

    if (existing) {
      console.log(`Conversa já existe: ${existing.id}`);
      return res.json({ conversation: existing, existingConversation: true });
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

    console.log(`Nova conversa criada: ${data.id}`);

    // Invalidar cache de conversas dos dois usuários
    CacheService.invalidateConversations(req.userId!);
    CacheService.invalidateConversations(String(receiverId));

    res.status(201).json({ conversation: data, existingConversation: false });
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

    // Atualizar timestamp da conversa e invalidar caches em background (não bloqueia resposta)
    Promise.all([
      supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId),
    ]).then(() => {
      // Invalidar caches após atualizar
      CacheService.invalidateMessages(conversationId);
      if (conversation.user1_id) {
        CacheService.invalidateConversations(String(conversation.user1_id));
      }
      if (conversation.user2_id) {
        CacheService.invalidateConversations(String(conversation.user2_id));
      }
    }).catch(err => {
      console.error('Background update error:', err);
    });

    // Retorna imediatamente
    res.status(201).json({ message: data });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
