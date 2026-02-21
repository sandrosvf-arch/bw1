import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Home as HomeIcon, Bed, Bath, DollarSign, MapPin, Car, Filter, ArrowUpDown, Search, ArrowLeft, X } from "lucide-react";
import api from "../../services/api";

import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import AppShell from "./components/AppShell";
import ListingsGrid from "./components/ListingsGrid";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import TermsModal from "../../components/TermsModal";
import { useTermsModal } from "../../hooks/useTermsModal";

import * as BrandMod from "./content/brand.js";
import * as NavMod from "./content/navigation.js";
import * as HeroMod from "./content/hero.js";
import * as FooterMod from "./content/footer.js";

const BRAND = BrandMod.default ?? BrandMod.BRAND;
const NAVIGATION = NavMod.default ?? NavMod.NAVIGATION;
const HERO = HeroMod.default ?? HeroMod.HERO;
const FOOTER = FooterMod.default ?? FooterMod.FOOTER;

// Helper para buscar em location (suporta string ou objeto)
function searchInLocation(location, searchTerm) {
  if (!location || !searchTerm) return false;
  const term = searchTerm.toLowerCase();
  
  if (typeof location === 'string') {
    return location.toLowerCase().includes(term);
  }
  
  if (typeof location === 'object') {
    const city = (location.city || '').toLowerCase();
    const state = (location.state || '').toLowerCase();
    const neighborhood = (location.neighborhood || '').toLowerCase();
    return city.includes(term) || state.includes(term) || neighborhood.includes(term);
  }
  
  return false;
}

// Helper para converter preço em número
function parsePrice(price) {
  if (typeof price === 'number') return price;
  if (typeof price === 'string') {
    return parseFloat(price.replace(/[^\d,]/g, "").replace(",", "."));
  }
  return 0;
}

export default function PropertiesPage() {
  const { showTermsModal, handleAcceptTerms } = useTermsModal();
  
  // Tentar buscar do cache geral primeiro (da homepage), depois cache específico
  const generalCache = api.getListingsFromCache();
  const specificCache = api.getListingsFromCache({ category: 'property' });
  
  // Filtrar imóveis do cache geral
  const generalProperties = generalCache?.listings?.filter(item => 
    item.category === 'property' || item.category === 'apartamento' || item.category === 'casa'
  ) || [];
  
  // Usar cache específico se houver, senão usar imóveis do cache geral
  const initialListings = specificCache?.listings?.length > 0 
    ? specificCache.listings 
    : generalProperties;
  
  const navigate = useNavigate();
  const [logoOk, setLogoOk] = React.useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [committedSearchTerm, setCommittedSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySubmitted, setNotifySubmitted] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [allListings, setAllListings] = useState(initialListings);
  const [listings, setListings] = useState(initialListings.slice(0, 4));
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(4);
  const [hasMore, setHasMore] = useState(initialListings.length > 4);
  const observerRef = useRef(null);
  const searchModeRef = useRef(false); // impede background fetch sobrescrever resultados de busca
  const BATCH_SIZE = 4;
  const [filters, setFilters] = useState({
    dealType: "all",
    minPrice: "",
    maxPrice: "",
    country: "Brasil",
    state: "",
    city: "",
    propertyType: "all",
    minBeds: "",
    minBaths: "",
    minArea: "",
    minParkingSpaces: "",
    acceptsPets: "all",
    furnished: "all",
    floor: "all",
  });

  // Buscar anúncios atualizados em background (não bloqueante)
  useEffect(() => {
    const fetchUpdatedListings = async () => {
      try {
        const response = await api.getListings({ category: 'property' });
        const fetchedListings = response.listings || [];
        
        // Atualiza os dados em background (ignora se usuário está em modo de busca)
        if (!searchModeRef.current) {
          setAllListings(fetchedListings);
        }
        
        // Se não tinha cache inicial, mostra os primeiros resultados
        if (initialListings.length === 0 && !searchModeRef.current) {
          setListings(fetchedListings.slice(0, BATCH_SIZE));
          setOffset(BATCH_SIZE);
          setHasMore(fetchedListings.length > BATCH_SIZE);
        }
      } catch (error) {
        console.error('Erro ao carregar imóveis:', error);
        // Não mostra erro se já tem cache
        if (initialListings.length === 0) {
          setError('Erro ao carregar imóveis. Tente novamente.');
        }
      }
    };

    fetchUpdatedListings();
  }, []);

  // Intersection Observer para scroll infinito
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading && !isSearching) {
          loadMoreListings();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      // disconnect() sempre limpa o observer, independente do ref estar nulo
      observer.disconnect();
    };
  }, [hasMore, loadingMore, loading, offset, isSearching]);

  const loadMoreListings = async () => {
    if (loadingMore || !hasMore || isSearching) return;

    setLoadingMore(true);
    try {
      const newListings = allListings.slice(offset, offset + BATCH_SIZE);
      
      if (newListings.length > 0) {
        setListings(prev => [...prev, ...newListings]);
        setOffset(prev => prev + BATCH_SIZE);
        setHasMore(offset + BATCH_SIZE < allListings.length);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Erro ao carregar mais imóveis:', error);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  // Busca manual — só executa ao clicar na lupa ou pressionar Enter
  const handleSearchSubmit = async () => {
    if (isSearching) return; // evita disparos múltiplos
    const term = searchTerm.trim();
    if (term === committedSearchTerm) return;
    setCommittedSearchTerm(term);
    searchModeRef.current = !!term;
    setNotifyEmail("");
    setNotifySubmitted(false);
    setIsSearching(true);
    try {
      const response = await api.getListings({
        category: 'property',
        ...(term ? { search: term } : {}),
        limit: 100,
      }, { forceRefresh: true });
      const fetched = response.listings || [];
      setAllListings(fetched);
      // Em modo busca: mostrar todos os resultados de uma vez (sem infinite scroll)
      // Isso evita o loop onde o infinite scroll carrega itens que não correspondem ao filtro
      if (term) {
        setListings(fetched);
        setOffset(fetched.length);
        setHasMore(false);
      } else {
        setListings(fetched.slice(0, BATCH_SIZE));
        setOffset(BATCH_SIZE);
        setHasMore(fetched.length > BATCH_SIZE);
      }
    } catch (err) {
      console.error('Erro na busca:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') handleSearchSubmit();
  };

  const handleClearSearch = async () => {
    setSearchTerm("");
    if (committedSearchTerm === "") return;
    setCommittedSearchTerm("");
    searchModeRef.current = false; // sai do modo busca
    setNotifyEmail("");
    setNotifySubmitted(false);
    setIsSearching(true);
    try {
      const response = await api.getListings({ category: 'property', limit: 50 }, { forceRefresh: true });
      const fetched = response.listings || [];
      setAllListings(fetched);
      setListings(fetched.slice(0, BATCH_SIZE));
      setOffset(BATCH_SIZE);
      setHasMore(fetched.length > BATCH_SIZE);
    } catch (err) {
      console.error('Erro ao limpar busca:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const filteredListings = useMemo(() => {
    let result = listings.filter((item) => {
      // Apenas imóveis (suporta PT e EN)
      const isProperty = item.category === "property" || 
                         item.category === "apartamento" || 
                         item.category === "casa";
      return isProperty;
    });

    // Busca (filtro local complementar ao resultado da API)
    if (committedSearchTerm) {
      const s = committedSearchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          (item.title && typeof item.title === 'string' && item.title.toLowerCase().includes(s)) ||
          searchInLocation(item.location, s)
      );
    }

    // Tipo de negócio
    if (filters.dealType !== "all") {
      result = result.filter((item) => item.dealType === filters.dealType);
    }

    // Preço
    const minPrice = parseFloat(filters.minPrice) || 0;
    const maxPrice = parseFloat(filters.maxPrice) || Infinity;
    result = result.filter((item) => {
      const price = parsePrice(item.price);
      return price >= minPrice && price <= maxPrice;
    });

    // Localização hierárquica (País -> Estado -> Cidade)
    if (filters.city) {
      // Se cidade está definida, filtra pela cidade
      result = result.filter((item) =>
        searchInLocation(item.location, filters.city)
      );
    } else if (filters.state) {
      // Se apenas estado está definido, filtra pelo estado
      result = result.filter((item) =>
        searchInLocation(item.location, filters.state)
      );
    }
    // Se apenas país (Brasil) está definido, mostra todos (não filtra)

    // Tipo de imóvel
    if (filters.propertyType !== "all") {
      const matchesType = (item) => {
        const title = item.title?.toLowerCase() || "";
        const type = filters.propertyType.toLowerCase();
        return title.includes(type);
      };
      result = result.filter(matchesType);
    }

    // Quartos
    if (filters.minBeds) {
      result = result.filter(
        (item) =>
          item.details?.beds && item.details.beds >= parseInt(filters.minBeds)
      );
    }

    // Banheiros
    if (filters.minBaths) {
      result = result.filter(
        (item) =>
          item.details?.baths &&
          item.details.baths >= parseInt(filters.minBaths)
      );
    }

    // Área
    if (filters.minArea) {
      result = result.filter((item) => {
        const areaValue = item.details?.area
          ? (typeof item.details.area === 'string'
              ? parseInt(item.details.area.replace(/\D/g, ""))
              : parseInt(item.details.area))
          : 0;
        return areaValue >= parseInt(filters.minArea);
      });
    }

    // Vagas de Garagem
    if (filters.minParkingSpaces) {
      result = result.filter((item) => {
        const parkingValue = item.details?.parkingSpaces
          ? parseInt(item.details.parkingSpaces)
          : 0;
        return parkingValue >= parseInt(filters.minParkingSpaces);
      });
    }

    // Aceita Pet
    if (filters.acceptsPets !== "all") {
      result = result.filter(
        (item) =>
          item.details?.acceptsPets &&
          item.details.acceptsPets === filters.acceptsPets
      );
    }

    // Mobiliado
    if (filters.furnished !== "all") {
      result = result.filter(
        (item) =>
          item.details?.furnished &&
          item.details.furnished === filters.furnished
      );
    }

    // Andar
    if (filters.floor !== "all") {
      result = result.filter(
        (item) => item.details?.floor && item.details.floor === filters.floor
      );
    }

    // Função para calcular score de proximidade
    const getProximityScore = (item) => {
      if (!item.location || typeof item.location !== 'string') return 0;
      const itemLocation = item.location.toLowerCase();
      
      // Se cidade está definida, prioriza matches de cidade
      if (filters.city) {
        const searchCity = filters.city.toLowerCase();
        if (itemLocation === searchCity || itemLocation.startsWith(searchCity + ",")) return 3;
        if (itemLocation.includes(searchCity)) return 2;
      }
      
      // Se estado está definido, prioriza matches de estado
      if (filters.state) {
        const searchState = filters.state.toLowerCase();
        if (itemLocation.includes(searchState)) return 1;
      }
      
      return 0;
    };

    // Ordenação
    if (sortBy === "relevance") {
      // Ordenação padrão: prioriza localização próxima
      result.sort((a, b) => {
        const scoreA = getProximityScore(a);
        const scoreB = getProximityScore(b);
        return scoreB - scoreA;
      });
    } else if (sortBy === "price-asc") {
      result.sort((a, b) => {
        const priceA = typeof a.price === 'number' ? a.price : parseFloat(
          String(a.price).replace(/[^\d,]/g, "").replace(",", ".")
        );
        const priceB = typeof b.price === 'number' ? b.price : parseFloat(
          String(b.price).replace(/[^\d,]/g, "").replace(",", ".")
        );
        return priceA - priceB;
      });
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => {
        const priceA = typeof a.price === 'number' ? a.price : parseFloat(
          String(a.price).replace(/[^\d,]/g, "").replace(",", ".")
        );
        const priceB = typeof b.price === 'number' ? b.price : parseFloat(
          String(b.price).replace(/[^\d,]/g, "").replace(",", ".")
        );
        return priceB - priceA;
      });
    } else if (sortBy === "area-desc") {
      result.sort((a, b) => {
        const areaA = a.details?.area
          ? (typeof a.details.area === 'string' ? parseInt(a.details.area) : a.details.area)
          : 0;
        const areaB = b.details?.area
          ? (typeof b.details.area === 'string' ? parseInt(b.details.area) : b.details.area)
          : 0;
        return areaB - areaA;
      });
    }

    return result;
  }, [committedSearchTerm, filters, sortBy, listings]);

  // Filtrar os listings carregados
  const displayedListings = useMemo(() => {
    return filteredListings;
  }, [filteredListings]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setDisplayCount(20); // Reset pagination when filters change
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      dealType: "all",
      minPrice: "",
      maxPrice: "",
      country: "Brasil",
      state: "",
      city: "",
      propertyType: "all",
      minBeds: "",
      minBaths: "",
      minArea: "",
      minParkingSpaces: "",
      acceptsPets: "all",
      furnished: "all",
      floor: "all",
    });
  }, []);

  const hasActiveFilters =
    filters.dealType !== "all" ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.state ||
    filters.city ||
    filters.propertyType !== "all" ||
    filters.minBeds ||
    filters.minBaths ||
    filters.minArea ||
    filters.minParkingSpaces ||
    filters.acceptsPets !== "all" ||
    filters.furnished !== "all" ||
    filters.floor !== "all";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 relative">
      <TermsModal isOpen={showTermsModal} onAccept={handleAcceptTerms} />
      <AppShell
        header={
          <nav className="fixed top-0 left-0 right-0 z-[9999] bg-slate-900 text-white border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-20">
                <div className="flex items-center gap-3">
                  <Link
                    to="/"
                    className="p-2 rounded-xl hover:bg-slate-800 transition text-white"
                    title="Voltar"
                  >
                    <ArrowLeft size={24} />
                  </Link>
                  <Link to="/">
                    <div
                      className="rounded-xl px-3 py-2 flex items-center cursor-pointer hover:opacity-80 transition"
                      style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      {logoOk ? (
                        <img
                          src="/logo-bw1.png"
                          alt={BRAND?.name || "BW1"}
                          className="h-10 w-auto"
                          onError={() => setLogoOk(false)}
                        />
                      ) : (
                        <span className="text-xl font-bold tracking-tighter text-slate-900">
                          {BRAND?.name || "BW1"}
                        </span>
                      )}
                    </div>
                  </Link>
                  <span className="text-base sm:text-lg border-l border-slate-700/80 pl-3 flex items-center gap-2">
                    <HomeIcon size={20} />
                    <span className="font-bold">Imóveis</span>
                  </span>
                </div>
              </div>
            </div>
          </nav>
        }
      >
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-28 lg:pb-8 pt-6">
          {/* Barra de busca */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar imóveis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-4 pr-24 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 placeholder-slate-400"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="p-1 text-slate-400 hover:text-slate-600 transition"
                    title="Limpar busca"
                  >
                    <X size={16} />
                  </button>
                )}
                <button
                  onClick={handleSearchSubmit}
                  disabled={isSearching}
                  className="flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg p-1.5 transition"
                  title="Buscar"
                >
                  {isSearching ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <Search size={16} />
                  )}
                </button>
              </div>
            </div>
            {committedSearchTerm && (
              <p className="mt-2 text-sm text-slate-500">
                Resultados para: <span className="font-semibold text-slate-700">"{committedSearchTerm}"</span>
              </p>
            )}
          </div>

          {/* Tabs de navegação */}
          <div className="flex justify-center mb-6">
            <div className="bg-white p-1.5 rounded-2xl shadow-lg inline-flex">
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all text-slate-600 hover:bg-slate-50"
              >
                Todos
              </button>

              <button
                onClick={() => navigate("/veiculos")}
                className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 text-slate-600 hover:bg-slate-50"
              >
                <Car size={16} /> Veículos
              </button>

              <button
                className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 bg-emerald-600 text-white shadow-md"
              >
                <HomeIcon size={16} /> Imóveis
              </button>
            </div>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <p className="font-medium">{error}</p>
              <button
                onClick={loadListings}
                className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium underline"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* Barra de Filtros e Ordenacao lado a lado */}
          <div className="flex items-center gap-3 mb-6">
            {/* Botao Filtros */}
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={
                isFiltersOpen || hasActiveFilters
                  ? "flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all bg-emerald-600 text-white shadow-lg"
                  : "flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
              }
            >
              <Filter size={18} />
              Filtros
              {hasActiveFilters && (
                <span className="ml-1 bg-white text-emerald-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  !
                </span>
              )}
            </button>

            {/* Dropdown de Ordenacao */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 pr-10 rounded-xl font-semibold text-sm bg-white text-slate-700 border border-slate-200 hover:border-emerald-400 hover:shadow-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer"
              >
                <option value="relevance" className="py-3">Mais relevantes</option>
                <option value="recent" className="py-3">Mais recentes</option>
                <option value="price-asc" className="py-3">Menor preco</option>
                <option value="price-desc" className="py-3">Maior preco</option>
                <option value="area-desc" className="py-3">Maior area</option>
              </select>
              <ArrowUpDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Contador de resultados */}
            <span className="text-sm text-slate-600 hidden sm:block ml-auto">
              {filteredListings.length} resultado(s)
            </span>
          </div>

          {/* Filter Panel */}
          {isFiltersOpen && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-slate-200">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <HomeIcon size={20} className="text-emerald-600" />
                  Filtros para Imóveis
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Localização Hierárquica */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <MapPin size={16} className="inline mr-1" />
                    Localização
                  </label>
                  <div className="space-y-2">
                    {/* País */}
                    <input
                      type="text"
                      placeholder="País"
                      value={filters.country}
                      disabled
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-100 cursor-not-allowed"
                    />
                    {/* Estado */}
                    <input
                      type="text"
                      placeholder="Estado (Ex: Paraná)"
                      value={filters.state}
                      onChange={(e) =>
                        handleFilterChange("state", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                    {/* Cidade */}
                    <input
                      type="text"
                      placeholder="Cidade (Ex: Curitiba)"
                      value={filters.city}
                      onChange={(e) =>
                        handleFilterChange("city", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Tipo de Imóvel */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tipo de imóvel
                  </label>
                  <select
                    value={filters.propertyType}
                    onChange={(e) =>
                      handleFilterChange("propertyType", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="all">Todos</option>
                    <option value="apartamento">Apartamentos</option>
                    <option value="casa">Casas</option>
                    <option value="terreno">Terrenos</option>
                    <option value="comercial">Comerciais</option>
                    <option value="sitio">Sítios</option>
                    <option value="fazenda">Fazendas</option>
                  </select>
                </div>

                {/* Tipo de negócio */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tipo de negócio
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["all", "Venda", "Aluguel"].map((type) => (
                      <button
                        key={type}
                        onClick={() => handleFilterChange("dealType", type)}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition ${
                          filters.dealType === type
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {type === "all" ? "Todos" : type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preço */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <DollarSign size={16} className="inline mr-1" />
                    Preço
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Mínimo"
                      value={filters.minPrice}
                      onChange={(e) =>
                        handleFilterChange("minPrice", e.target.value)
                      }
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                      type="number"
                      placeholder="Máximo"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        handleFilterChange("maxPrice", e.target.value)
                      }
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Quartos mínimos */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Bed size={16} className="inline mr-1" />
                    Quartos mínimos
                  </label>
                  <input
                    type="number"
                    placeholder="Ex: 2"
                    value={filters.minBeds}
                    onChange={(e) =>
                      handleFilterChange("minBeds", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Banheiros mínimos */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Bath size={16} className="inline mr-1" />
                    Banheiros mínimos
                  </label>
                  <input
                    type="number"
                    placeholder="Ex: 1"
                    value={filters.minBaths}
                    onChange={(e) =>
                      handleFilterChange("minBaths", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Área mínima */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Área mínima (m²)
                  </label>
                  <input
                    type="number"
                    placeholder="Ex: 80"
                    value={filters.minArea}
                    onChange={(e) =>
                      handleFilterChange("minArea", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Vagas mínimas */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Vagas mínimas
                  </label>
                  <select
                    value={filters.minParkingSpaces}
                    onChange={(e) =>
                      handleFilterChange("minParkingSpaces", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="">Qualquer</option>
                    <option value="1">1+ vaga</option>
                    <option value="2">2+ vagas</option>
                    <option value="3">3+ vagas</option>
                    <option value="4">4+ vagas</option>
                  </select>
                </div>

                {/* Aceita Pet */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Aceita Pet
                  </label>
                  <select
                    value={filters.acceptsPets}
                    onChange={(e) =>
                      handleFilterChange("acceptsPets", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="all">Tanto faz</option>
                    <option value="yes">Sim</option>
                    <option value="no">Não</option>
                    <option value="negotiate">A negociar</option>
                  </select>
                </div>

                {/* Mobiliado */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Mobiliado
                  </label>
                  <select
                    value={filters.furnished}
                    onChange={(e) =>
                      handleFilterChange("furnished", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="all">Tanto faz</option>
                    <option value="yes">Sim, mobiliado</option>
                    <option value="semi">Semi-mobiliado</option>
                    <option value="no">Não mobiliado</option>
                  </select>
                </div>

                {/* Andar */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Andar/Posição
                  </label>
                  <select
                    value={filters.floor}
                    onChange={(e) => handleFilterChange("floor", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="all">Qualquer</option>
                    <option value="terreo">Térreo</option>
                    <option value="baixo">Baixo (1-5)</option>
                    <option value="medio">Médio (6-10)</option>
                    <option value="alto">Alto (11+)</option>
                    <option value="cobertura">Cobertura</option>
                  </select>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-200">
                {hasActiveFilters ? (
                  <>
                    <button
                      onClick={clearFilters}
                      className="w-full px-6 py-3 rounded-xl font-semibold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                    >
                      Limpar filtros
                    </button>
                    <button
                      onClick={() => setIsFiltersOpen(false)}
                      className="w-full px-6 py-3 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition"
                    >
                      Aplicar filtros
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsFiltersOpen(false)}
                    className="col-span-2 w-full px-6 py-3 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition"
                  >
                    Aplicar filtros
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Card de loading inicial quando não há anúncios */}
          {isSearching ? (
            /* Spinner de busca */
            <div className="flex items-center justify-center py-12">
              <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                <div className="mb-6">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Buscando imóveis...</h3>
                <p className="text-slate-600 text-base">Procurando por “{searchTerm}” em toda a base</p>
              </div>
            </div>
          ) : committedSearchTerm && listings.length === 0 ? (
            /* Sem resultados — convite de notificação */
            <div className="flex items-center justify-center py-12">
              <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                <div className="mb-6">
                  <div className="mx-auto w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
                    <span className="text-4xl">🏡</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Que pena!</h3>
                <p className="text-slate-600 text-base mb-1">
                  Ainda não temos imóveis com
                </p>
                <p className="text-emerald-700 font-semibold text-lg mb-4">“{committedSearchTerm}”</p>
                <p className="text-slate-500 text-sm mb-6">
                  Deixe seu e-mail e avisamos assim que alguém anunciar um imóvel com esse perfil.
                </p>
                {notifySubmitted ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-700 font-semibold">
                    ✅ Pronto! Você será avisado.
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="seu@email.com"
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    />
                    <button
                      onClick={() => { if (notifyEmail) setNotifySubmitted(true); }}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition whitespace-nowrap"
                    >
                      Me avisar
                    </button>
                  </div>
                )}
                <button
                  onClick={handleClearSearch}
                  className="mt-4 text-sm text-slate-500 hover:text-slate-700 underline"
                >
                  Limpar busca e ver todos os imóveis
                </button>
              </div>
            </div>
          ) : listings.length === 0 ? (
            /* Spinner inicial (sem busca activa) */
            <div className="flex items-center justify-center py-12">
              <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                <div className="mb-6">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Carregando imóveis</h3>
                <p className="text-slate-600 text-base">Estamos buscando os melhores imóveis para você</p>
                <div className="mt-6 flex justify-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <ListingsGrid listings={displayedListings} loading={false} />
              
              {/* Observer target para scroll infinito */}
              {hasMore && <div ref={observerRef} className="h-4" />}
            </>
          )}
          
          {/* Card de loading para scroll infinito */}
          {loadingMore && listings.length > 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                <div className="mb-6">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  Carregando imóveis
                </h3>
                <p className="text-slate-600 text-base">
                  Estamos buscando os melhores imóveis para você
                </p>
                <div className="mt-6 flex justify-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          {/* Mensagem quando não há mais anúncios */}
          {!hasMore && listings.length > 0 && (
            <div className="text-center py-8">
              <p className="text-slate-500">Não há mais imóveis para exibir</p>
            </div>
          )}
          
          <CTA />
        </main>

        <Footer brand={BRAND} footer={FOOTER} />
        <BottomNav />
      </AppShell>
    </div>
  );
}
