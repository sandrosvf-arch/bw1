import { Router } from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Cache simples para listagens
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos

function parseJsonField(value: any) {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function getCacheKey(params: any): string {
  return JSON.stringify(params);
}

function getFromCache(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('✅ Cache hit:', key);
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
  // Limpar cache antigo
  if (cache.size > 50) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) {
      cache.delete(oldestKey);
    }
  }
}

// Listar todos os anúncios (público)
router.get('/', async (req, res) => {
  try {
    const { category, type, search, limit = 20, offset = 0 } = req.query;
    const cacheKey = getCacheKey({ category, type, search, limit, offset });

    // Tentar buscar do cache
    const cachedData = getFromCache(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    let query = supabase
      .from('listings')
      .select('id,title,price,category,type,dealType,location,images,details,contact,status,created_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (category) {
      // Suportar filtro por categoria em PT e EN
      if (category === 'vehicle') {
        query = query.or('category.eq.vehicle,category.eq.carro');
      } else if (category === 'property') {
        query = query.or('category.eq.property,category.eq.apartamento,category.eq.casa');
      } else {
        query = query.eq('category', category);
      }
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    query = query.range(Number(offset), Number(offset) + Number(limit) - 1);

    const { data, error } = await query;

    if (error) throw error;

    // Processar dados para garantir que campos JSONB sejam objetos
    const processedData = (data || []).map(listing => ({
      ...listing,
      location: parseJsonField(listing.location),
      details: parseJsonField(listing.details),
      contact: parseJsonField(listing.contact),
    }));

    const response = { listings: processedData, total: processedData.length };
    
    // Salvar no cache
    setCache(cacheKey, response);

    res.json(response);
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ error: 'Failed to get listings' });
  }
});

// Obter um anúncio específico (público)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        users:user_id (id, name, phone, email, avatar)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Processar dados para garantir que campos JSONB sejam objetos
    const processedListing = {
      ...data,
      location: typeof data.location === 'string' ? JSON.parse(data.location) : data.location,
      details: typeof data.details === 'string' ? JSON.parse(data.details) : data.details,
      contact: typeof data.contact === 'string' ? JSON.parse(data.contact) : data.contact,
    };

    res.json({ listing: processedListing });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ error: 'Failed to get listing' });
  }
});

// Criar anúncio (autenticado)
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      type,
      dealType,
      location,
      images,
      details,
      contact,
    } = req.body;

    if (!title || !price || !category || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('listings')
      .insert({
        user_id: req.userId,
        title,
        description,
        price,
        category,
        type,
        dealType,
        location,
        images: images || [],
        details: details || {},
        contact: contact || {},
        status: 'active',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Processar dados para garantir que campos JSONB sejam objetos
    const processedListing = {
      ...data,
      location: typeof data.location === 'string' ? JSON.parse(data.location) : data.location,
      details: typeof data.details === 'string' ? JSON.parse(data.details) : data.details,
      contact: typeof data.contact === 'string' ? JSON.parse(data.contact) : data.contact,
    };

    res.status(201).json({ listing: processedListing });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// Atualizar anúncio (autenticado, apenas próprio anúncio)
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Verificar se o anúncio pertence ao usuário
    const { data: listing } = await supabase
      .from('listings')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!listing || listing.user_id !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { data, error } = await supabase
      .from('listings')
      .update({
        ...req.body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Processar dados para garantir que campos JSONB sejam objetos
    const processedListing = {
      ...data,
      location: typeof data.location === 'string' ? JSON.parse(data.location) : data.location,
      details: typeof data.details === 'string' ? JSON.parse(data.details) : data.details,
      contact: typeof data.contact === 'string' ? JSON.parse(data.contact) : data.contact,
    };

    res.json({ listing: processedListing });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

// Deletar anúncio (autenticado, apenas próprio anúncio)
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Verificar se o anúncio pertence ao usuário
    const { data: listing } = await supabase
      .from('listings')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!listing || listing.user_id !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

// Meus anúncios (autenticado)
router.get('/user/my-listings', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Processar dados para garantir que campos JSONB sejam objetos
    const processedData = (data || []).map(listing => ({
      ...listing,
      location: typeof listing.location === 'string' ? JSON.parse(listing.location) : listing.location,
      details: typeof listing.details === 'string' ? JSON.parse(listing.details) : listing.details,
      contact: typeof listing.contact === 'string' ? JSON.parse(listing.contact) : listing.contact,
    }));

    res.json({ listings: processedData });
  } catch (error) {
    console.error('Get my listings error:', error);
    res.status(500).json({ error: 'Failed to get listings' });
  }
});

export default router;
