import NodeCache from 'node-cache';

// Configuração do cache com TTL de 15 minutos (900 segundos)
const cache = new NodeCache({
  stdTTL: 900, // 15 minutos
  checkperiod: 120, // Verifica items expirados a cada 2 minutos
  useClones: false, // Melhor performance
});

class CacheService {
  // Prefixos para organizar os tipos de cache
  private static LISTING_PREFIX = 'listing:';
  private static LISTINGS_PREFIX = 'listings:';
  private static CONVERSATIONS_PREFIX = 'conversations:';
  private static MESSAGES_PREFIX = 'messages:';

  /**
   * Gera a chave do cache para um anúncio individual
   */
  private static getListingKey(id: string): string {
    return `${this.LISTING_PREFIX}${id}`;
  }

  /**
   * Gera a chave do cache para listagens com filtros
   */
  private static getListingsKey(params: any): string {
    return `${this.LISTINGS_PREFIX}${JSON.stringify(params)}`;
  }

  /**
   * Busca um anúncio no cache
   */
  static getListing(id: string): any {
    const key = this.getListingKey(id);
    const data = cache.get(key);
    
    if (data) {
      console.log(`✅ Cache hit: ${key}`);
    } else {
      console.log(`❌ Cache miss: ${key}`);
    }
    
    return data;
  }

  /**
   * Salva/atualiza um anúncio no cache
   */
  static setListing(id: string, data: any): void {
    const key = this.getListingKey(id);
    cache.set(key, data);
    console.log(`💾 Cache set: ${key}`);
  }

  /**
   * Busca listagens filtradas no cache
   */
  static getListings(params: any): any {
    const key = this.getListingsKey(params);
    const data = cache.get(key);
    
    if (data) {
      console.log(`✅ Cache hit: ${key}`);
    } else {
      console.log(`❌ Cache miss: ${key}`);
    }
    
    return data;
  }

  /**
   * Salva listagens filtradas no cache
   */
  static setListings(params: any, data: any): void {
    const key = this.getListingsKey(params);
    cache.set(key, data);
    console.log(`💾 Cache set: ${key}`);
  }

  /**
   * Remove um anúncio específico do cache
   */
  static deleteListing(id: string): void {
    const key = this.getListingKey(id);
    cache.del(key);
    console.log(`🗑️ Cache deleted: ${key}`);
  }

  /**
   * Invalida todos os caches de listagens
   * Usado quando um novo anúncio é criado ou atualizado
   */
  static invalidateListingsCache(): void {
    const keys = cache.keys();
    const listingsKeys = keys.filter(key => key.startsWith(this.LISTINGS_PREFIX));
    
    listingsKeys.forEach(key => {
      cache.del(key);
    });
    
    console.log(`🗑️ Invalidated ${listingsKeys.length} listings cache entries`);
  }

  /**
   * Limpa todo o cache
   */
  static clearAll(): void {
    cache.flushAll();
    console.log('🗑️ All cache cleared');
  }

  /**
   * Obtém estatísticas do cache
   */
  static getStats() {
    return cache.getStats();
  }

  // ============= CHAT CACHE METHODS =============

  /**
   * Busca conversas do usuário no cache
   */
  static getConversations(userId: string): any {
    const key = `${this.CONVERSATIONS_PREFIX}${userId}`;
    const data = cache.get(key);
    
    if (data) {
      console.log(`✅ Cache hit: ${key}`);
    } else {
      console.log(`❌ Cache miss: ${key}`);
    }
    
    return data;
  }

  /**
   * Salva conversas do usuário no cache
   */
  static setConversations(userId: string, data: any): void {
    const key = `${this.CONVERSATIONS_PREFIX}${userId}`;
    cache.set(key, data);
    console.log(`💾 Cache set: ${key}`);
  }

  /**
   * Invalida cache de conversas do usuário
   */
  static invalidateConversations(userId: string): void {
    const key = `${this.CONVERSATIONS_PREFIX}${userId}`;
    cache.del(key);
    console.log(`🗑️ Cache deleted: ${key}`);
  }

  /**
   * Busca mensagens de uma conversa no cache
   */
  static getMessages(conversationId: string): any {
    const key = `${this.MESSAGES_PREFIX}${conversationId}`;
    const data = cache.get(key);
    
    if (data) {
      console.log(`✅ Cache hit: ${key}`);
    } else {
      console.log(`❌ Cache miss: ${key}`);
    }
    
    return data;
  }

  /**
   * Salva mensagens de uma conversa no cache
   */
  static setMessages(conversationId: string, data: any): void {
    const key = `${this.MESSAGES_PREFIX}${conversationId}`;
    cache.set(key, data);
    console.log(`💾 Cache set: ${key}`);
  }

  /**
   * Invalida cache de mensagens de uma conversa
   */
  static invalidateMessages(conversationId: string): void {
    const key = `${this.MESSAGES_PREFIX}${conversationId}`;
    cache.del(key);
    console.log(`🗑️ Cache deleted: ${key}`);
  }
}

// Event listener para quando um item expira
cache.on('expired', (key: string, value: any) => {
  console.log(`⏰ Cache expired: ${key}`);
  
  // Se for um anúncio individual, podemos fazer revalidação aqui
  if (key.startsWith(CacheService['LISTING_PREFIX'])) {
    const listingId = key.replace(CacheService['LISTING_PREFIX'], '');
    console.log(`🔄 Listing ${listingId} cache expired, will be refreshed on next access`);
    // A revalidação acontecerá automaticamente na próxima requisição
  }
});

// Event listener para quando o cache atinge o limite
cache.on('flush', () => {
  console.log('🗑️ Cache was flushed');
});

export default CacheService;
