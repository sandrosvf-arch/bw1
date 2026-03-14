import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { supabase, supabaseAdmin } from '../config/supabase';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import CacheService from '../services/cache.service';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const videoUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

const STORAGE_BUCKET = 'listing-images';
const VIDEO_BUCKET = 'listing-videos';

// Garante que o bucket de imagens existe
(async () => {
  const { error } = await supabaseAdmin.storage.createBucket(STORAGE_BUCKET, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  });
  if (error && !error.message.includes('already exists')) {
    console.warn('⚠️ Bucket creation warning:', error.message);
  } else {
    console.log(`✅ Storage bucket '${STORAGE_BUCKET}' pronto`);
  }
})();

// Garante que o bucket de vídeos existe
(async () => {
  const { error } = await supabaseAdmin.storage.createBucket(VIDEO_BUCKET, {
    public: true,
    fileSizeLimit: 100 * 1024 * 1024,
    allowedMimeTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/mpeg'],
  });
  if (error && !error.message.includes('already exists')) {
    console.warn('⚠️ Video bucket warning:', error.message);
  } else {
    console.log(`✅ Storage bucket '${VIDEO_BUCKET}' pronto`);
  }
})();

const router = Router();

function parseJsonField(value: any) {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

// Mapa de normalização dos estados brasileiros
// Converte siglas, variações sem acento e grafias alternativas para o nome canônico
const STATE_CANONICAL: Record<string, string> = {
  'ac': 'Acre', 'acre': 'Acre',
  'al': 'Alagoas', 'alagoas': 'Alagoas',
  'ap': 'Amapá', 'amapá': 'Amapá', 'amapa': 'Amapá',
  'am': 'Amazonas', 'amazonas': 'Amazonas',
  'ba': 'Bahia', 'bahia': 'Bahia',
  'ce': 'Ceará', 'ceará': 'Ceará', 'ceara': 'Ceará',
  'df': 'Distrito Federal', 'distrito federal': 'Distrito Federal',
  'es': 'Espírito Santo', 'espírito santo': 'Espírito Santo', 'espirito santo': 'Espírito Santo',
  'go': 'Goiás', 'goiás': 'Goiás', 'goias': 'Goiás',
  'ma': 'Maranhão', 'maranhão': 'Maranhão', 'maranhao': 'Maranhão',
  'mt': 'Mato Grosso', 'mato grosso': 'Mato Grosso',
  'ms': 'Mato Grosso do Sul', 'mato grosso do sul': 'Mato Grosso do Sul',
  'mg': 'Minas Gerais', 'minas gerais': 'Minas Gerais',
  'pa': 'Pará', 'pará': 'Pará', 'para': 'Pará',
  'pb': 'Paraíba', 'paraíba': 'Paraíba', 'paraiba': 'Paraíba',
  'pr': 'Paraná', 'paraná': 'Paraná', 'parana': 'Paraná',
  'pe': 'Pernambuco', 'pernambuco': 'Pernambuco',
  'pi': 'Piauí', 'piauí': 'Piauí', 'piaui': 'Piauí',
  'rj': 'Rio de Janeiro', 'rio de janeiro': 'Rio de Janeiro',
  'rn': 'Rio Grande do Norte', 'rio grande do norte': 'Rio Grande do Norte',
  'rs': 'Rio Grande do Sul', 'rio grande do sul': 'Rio Grande do Sul',
  'ro': 'Rondônia', 'rondônia': 'Rondônia', 'rondonia': 'Rondônia',
  'rr': 'Roraima', 'roraima': 'Roraima',
  'sc': 'Santa Catarina', 'santa catarina': 'Santa Catarina',
  'sp': 'São Paulo', 'são paulo': 'São Paulo', 'sao paulo': 'São Paulo', 's paulo': 'São Paulo',
  'se': 'Sergipe', 'sergipe': 'Sergipe',
  'to': 'Tocantins', 'tocantins': 'Tocantins',
};

function normalizeState(raw: string): string {
  const key = raw.trim().toLowerCase().replace(/\s+/g, ' ');
  return STATE_CANONICAL[key] ?? raw.trim().replace(/\s+/g, ' ');
}

// Upload de imagem para Supabase Storage (autenticado)
router.post('/upload-image', authMiddleware, upload.single('image'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }

    const ext = req.file.mimetype.split('/')[1].replace('jpeg', 'jpg');
    const filePath = `${req.userId}/${uuidv4()}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    res.json({ url: publicUrl, path: filePath });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Falha ao fazer upload da imagem' });
  }
});

// Listar estados únicos com anúncios ativos (público)
router.get('/states', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('location')
      .eq('status', 'active');

    if (error) throw error;

    const stateMap = new Map<string, string>();
    for (const row of data || []) {
      const loc = parseJsonField(row.location);
      const raw: string | undefined = typeof loc === 'object' && loc !== null ? loc.state : undefined;
      if (raw && raw.trim()) {
        const canonical = normalizeState(raw);
        stateMap.set(canonical.toLowerCase(), canonical);
      }
    }
    const states = Array.from(stateMap.values()).sort((a, b) =>
      a.localeCompare(b, 'pt-BR')
    );
    res.json({ states });
  } catch (error) {
    console.error('Get states error:', error);
    res.status(500).json({ error: 'Failed to get states' });
  }
});

// Listar todos os anúncios (público)
router.get('/', async (req, res) => {
  try {
    const { category, type, search, state, limit = 20, offset = 0 } = req.query;
    const cacheParams = { category, type, search, state, limit, offset };

    // Tentar buscar do cache
    const cachedData = CacheService.getListings(cacheParams);
    if (cachedData) {
      return res.json(cachedData);
    }

    let query = supabase
      .from('listings')
      .select('id,user_id,title,price,category,type,dealType,location,images,details,contact,status,created_at,plan,featured')
      .eq('status', 'active')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (category) {
      // Suportar filtro por categoria em PT e EN
      if (category === 'vehicle') {
        query = query.or('category.eq.vehicle,category.eq.carro,category.eq.moto,category.eq.caminhao,category.eq.van,category.eq.pickup,category.eq.truck,category.eq.motorcycle,category.eq.onibus,category.eq.barco,category.eq.boat');
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

    if (state) {
      const canonical = normalizeState(String(state));
      const variations = Object.entries(STATE_CANONICAL)
        .filter(([, v]) => v === canonical)
        .map(([k]) => k);
      const allVariants = Array.from(new Set([canonical, ...variations, String(state)]));
      // location é varchar com JSON serializado.
      // Para nomes completos: busca o valor diretamente (%São Paulo%)
      // Para abreviações curtas (≤2 chars): usa contexto do JSON key para evitar falsos positivos
      const orClauses = allVariants
        .flatMap(v => {
          if (v.length <= 2) {
            return [`location.ilike.%"state":"${v}"%`, `location.ilike.%"state": "${v}"%`];
          }
          return [`location.ilike.%${v}%`];
        })
        .join(',');
      query = (query as any).or(orClauses);
    }

    query = query.range(Number(offset), Number(offset) + Number(limit) - 1);

    const { data, error } = await query;

    if (error) throw error;

    // Processar dados para garantir que campos JSONB sejam objetos
    // Apenas a 1ª imagem é retornada na listagem para reduzir bandwidth
    const processedData = (data || []).map(listing => {
      const imgs = parseJsonField(listing.images);
      const imgsArray = Array.isArray(imgs) ? imgs : (imgs ? [imgs] : []);
      return {
        ...listing,
        images: imgsArray.slice(0, 1), // apenas thumbnail na listagem
        location: parseJsonField(listing.location),
        details: parseJsonField(listing.details),
        contact: parseJsonField(listing.contact),
      };
    });

    const response = { listings: processedData, total: processedData.length };
    
    // Salvar no cache
    CacheService.setListings(cacheParams, response);

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

    // Tentar buscar do cache
    const cachedListing = CacheService.getListing(id);
    if (cachedListing) {
      return res.json({ listing: cachedListing });
    }

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

    // Salvar no cache
    CacheService.setListing(id, processedListing);

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

    // Salvar no cache e invalidar cache de listagens
    CacheService.setListing(data.id, processedListing);
    CacheService.invalidateListingsCache();

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

    // Atualizar cache e invalidar cache de listagens
    CacheService.setListing(id, processedListing);
    CacheService.invalidateListingsCache();

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

    // Remover do cache e invalidar cache de listagens
    CacheService.deleteListing(id);
    CacheService.invalidateListingsCache();

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
      .select('id,user_id,title,price,category,type,dealType,location,images,details,contact,status,created_at,plan,featured')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Processar dados para garantir que campos JSONB sejam objetos
    const processedData = (data || []).map(listing => {
      const imgs = parseJsonField(listing.images);
      const imgsArray = Array.isArray(imgs) ? imgs : (imgs ? [imgs] : []);
      return {
        ...listing,
        images: imgsArray, // Retorna todas as imagens pois o usuário edita suas listagens
        location: typeof listing.location === 'string' ? JSON.parse(listing.location) : listing.location,
        details: typeof listing.details === 'string' ? JSON.parse(listing.details) : listing.details,
        contact: typeof listing.contact === 'string' ? JSON.parse(listing.contact) : listing.contact,
      };
    });

    res.json({ listings: processedData });
  } catch (error) {
    console.error('Get my listings error:', error);
    res.status(500).json({ error: 'Failed to get listings' });
  }
});

// POST /api/listings/:id/video — upload de vídeo premium
router.post('/:id/video', authMiddleware, videoUpload.single('video'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    if (!req.file) return res.status(400).json({ error: 'Nenhum vídeo enviado' });

    // Verifica ownership
    const { data: listing, error: fetchErr } = await supabaseAdmin
      .from('listings')
      .select('user_id, details, plan')
      .eq('id', id)
      .single();

    if (fetchErr || !listing) return res.status(404).json({ error: 'Anúncio não encontrado' });
    if (listing.user_id !== req.userId) return res.status(403).json({ error: 'Sem permissão' });
    if (listing.plan !== 'premium') return res.status(403).json({ error: 'Upload de vídeo disponível apenas no plano Premium' });

    const ext = req.file.originalname.split('.').pop() || 'mp4';
    const fileName = `${req.userId}/${id}-${uuidv4()}.${ext}`;

    const { error: uploadErr } = await supabaseAdmin.storage
      .from(VIDEO_BUCKET)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (uploadErr) throw uploadErr;

    const { data: { publicUrl } } = supabaseAdmin.storage.from(VIDEO_BUCKET).getPublicUrl(fileName);

    // Salva video_url dentro do campo details (JSONB)
    const currentDetails = typeof listing.details === 'string' ? JSON.parse(listing.details) : (listing.details || {});
    const { error: updateErr } = await supabaseAdmin
      .from('listings')
      .update({ details: { ...currentDetails, video_url: publicUrl } })
      .eq('id', id);

    if (updateErr) throw updateErr;

    CacheService.invalidateListingsCache();

    return res.json({ success: true, video_url: publicUrl });
  } catch (error: any) {
    console.error('Video upload error:', error);
    return res.status(500).json({ error: 'Erro ao fazer upload do vídeo' });
  }
});

// POST /api/listings/:id/bump
// Volta o anúncio ao topo (consome 1 bump)
router.post('/:id/bump', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const { data: listing, error: fetchErr } = await supabaseAdmin
      .from('listings')
      .select('user_id, plan, bumps_remaining')
      .eq('id', id)
      .single();

    if (fetchErr || !listing) return res.status(404).json({ error: 'Anúncio não encontrado' });
    if (listing.user_id !== req.userId) return res.status(403).json({ error: 'Sem permissão' });
    if (!listing.bumps_remaining || listing.bumps_remaining <= 0) {
      return res.status(400).json({ error: 'Sem bumps disponíveis para este plano' });
    }

    const { error: updateErr } = await supabaseAdmin
      .from('listings')
      .update({
        bumped_at: new Date().toISOString(),
        bumps_remaining: listing.bumps_remaining - 1,
      })
      .eq('id', id);

    if (updateErr) throw updateErr;

    CacheService.invalidateListingsCache();

    return res.json({ success: true, bumps_remaining: listing.bumps_remaining - 1 });
  } catch (error) {
    console.error('Bump error:', error);
    return res.status(500).json({ error: 'Falha ao voltar ao topo' });
  }
});

export default router;
