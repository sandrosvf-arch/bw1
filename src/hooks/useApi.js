import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// ========== LISTINGS HOOKS ==========

/**
 * Hook para buscar listagens com filtros
 */
export function useListings(params = {}) {
  return useQuery({
    queryKey: ['listings', params],
    queryFn: async () => {
      const response = await api.getListings(params);
      return response.listings || [];
    },
    staleTime: 15 * 60 * 1000, // 15 minutos
  });
}

/**
 * Hook para buscar um anúncio específico
 */
export function useListing(id) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      const response = await api.getListings({ id });
      return response.listing;
    },
    enabled: !!id,
    staleTime: 15 * 60 * 1000, // 15 minutos
  });
}

/**
 * Hook para criar um novo anúncio
 */
export function useCreateListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (listingData) => api.createListing(listingData),
    onSuccess: () => {
      // Invalida cache de listagens para forçar atualização
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

/**
 * Hook para atualizar um anúncio
 */
export function useUpdateListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => api.updateListing(id, data),
    onSuccess: (_, { id }) => {
      // Invalida cache do anúncio específico e listagens
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

/**
 * Hook para deletar um anúncio
 */
export function useDeleteListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => api.deleteListing(id),
    onSuccess: (_, id) => {
      // Remove do cache e invalida listagens
      queryClient.removeQueries({ queryKey: ['listing', id] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

// ========== CHAT HOOKS ==========

/**
 * Hook para buscar conversas do usuário
 */
export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await api.getConversations();
      return response.conversations || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos (chats atualizam mais rápido)
  });
}

/**
 * Hook para buscar mensagens de uma conversa
 */
export function useMessages(conversationId) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const response = await api.getMessages(conversationId);
      return response.messages || [];
    },
    enabled: !!conversationId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

/**
 * Hook para enviar mensagem
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ conversationId, content }) => 
      api.sendMessage(conversationId, content),
    onSuccess: (_, { conversationId }) => {
      // Atualiza mensagens e conversas
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

/**
 * Hook para criar ou buscar conversa
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ listingId, receiverId }) => 
      api.createOrGetConversation(listingId, receiverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

// ========== FAVORITES HOOKS ==========

/**
 * Hook para buscar favoritos
 */
export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const response = await api.getFavorites();
      return response.favorites || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

/**
 * Hook para adicionar/remover favorito
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ listingId, isFavorite }) => 
      isFavorite 
        ? api.removeFavorite(listingId)
        : api.addFavorite(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}
