import { useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = 'bw1-favorites';

// Cache em memória para evitar múltiplas leituras do localStorage
let favoritesCache = null;
let cacheTime = 0;
const CACHE_DURATION = 5000; // 5 segundos

function getFavoritesFromStorage() {
  // Usar cache se ainda válido
  if (favoritesCache && Date.now() - cacheTime < CACHE_DURATION) {
    return favoritesCache;
  }

  try {
    const saved = localStorage.getItem(FAVORITES_KEY);
    const favorites = saved ? JSON.parse(saved) : [];
    favoritesCache = favorites;
    cacheTime = Date.now();
    return favorites;
  } catch (error) {
    console.error('Erro ao ler favoritos:', error);
    return [];
  }
}

function saveFavoritesToStorage(favorites) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    favoritesCache = favorites;
    cacheTime = Date.now();
  } catch (error) {
    console.error('Erro ao salvar favoritos:', error);
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => getFavoritesFromStorage());

  const isFavorite = useCallback((id) => {
    return favorites.includes(id);
  }, [favorites]);

  const toggleFavorite = useCallback((id) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(id)
        ? prev.filter(fId => fId !== id)
        : [...prev, id];
      
      saveFavoritesToStorage(newFavorites);
      return newFavorites;
    });
  }, []);

  const addFavorite = useCallback((id) => {
    setFavorites(prev => {
      if (prev.includes(id)) return prev;
      const newFavorites = [...prev, id];
      saveFavoritesToStorage(newFavorites);
      return newFavorites;
    });
  }, []);

  const removeFavorite = useCallback((id) => {
    setFavorites(prev => {
      const newFavorites = prev.filter(fId => fId !== id);
      saveFavoritesToStorage(newFavorites);
      return newFavorites;
    });
  }, []);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
  };
}
