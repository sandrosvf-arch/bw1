import { QueryClient } from '@tanstack/react-query';

// Configuração do React Query para otimizar performance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache de 15 minutos (mesma duração do backend)
      staleTime: 15 * 60 * 1000, // 15 minutos
      cacheTime: 30 * 60 * 1000, // 30 minutos
      // Retentar em caso de erro
      retry: 1,
      // Refetch automático desabilitado para economizar requisições
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  },
});
