import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Car, Calendar, DollarSign, MapPin, Gauge, Filter, ArrowUpDown, Home as HomeIcon, Search, ArrowLeft } from "lucide-react";
import api from "../../services/api";
import { useDebounce } from "../../hooks/useDebounce";

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

export default function VehiclesPage() {
  const { showTermsModal, handleAcceptTerms } = useTermsModal();
  
  // Tentar buscar do cache geral primeiro (da homepage), depois cache específico
  const generalCache = api.getListingsFromCache();
  const specificCache = api.getListingsFromCache({ category: 'vehicle' });
  
  // Filtrar veículos do cache geral
  const generalVehicles = generalCache?.listings?.filter(item => 
    item.category === 'vehicle' || item.category === 'carro'
  ) || [];
  
  // Usar cache específico se houver, senão usar veículos do cache geral
  const initialListings = specificCache?.listings?.length > 0 
    ? specificCache.listings 
    : generalVehicles;
  
  const navigate = useNavigate();
  const [logoOk, setLogoOk] = React.useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [listings, setListings] = useState(initialListings);
  const [loading, setLoading] = useState(initialListings.length === 0);
  const [error, setError] = useState(null);
  const [displayCount, setDisplayCount] = useState(12); // Quantidade inicial de anúncios a mostrar
  const [filters, setFilters] = useState({
    country: "Brasil",
    state: "",
    city: "",
    category: "all",
    dealType: "all",
    minPrice: "",
    maxPrice: "",
    minYear: "",
    maxYear: "",
    specificYear: "",
    minKm: "",
    maxKm: "",
    fuel: "all",
    bodyType: "all",
    transmission: "all",
    color: "all",
    doors: "all",
  });

  useEffect(() => {
    loadListings();
  }, []);

  // Reset pagination when search changes
  useEffect(() => {
    setDisplayCount(20);
  }, [debouncedSearchTerm]);

  const loadListings = useCallback(async () => {
    const cached = api.getListingsFromCache({ category: 'vehicle' });
    const hasCached = cached?.listings?.length > 0;

    if (hasCached) {
      setListings(cached.listings);
      setLoading(false);
    }

    try {
      setError(null);
      const response = await api.getListings({ category: 'vehicle' }, { forceRefresh: hasCached });
      setListings(response.listings || []);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
      setError('Erro ao carregar veículos. Tente novamente.');
      if (!hasCached) {
        setListings([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredListings = useMemo(() => {
    let result = listings.filter((item) => {
      // Apenas veículos (suporta PT e EN)
      const isVehicle = item.category === "vehicle" || item.category === "carro";
      if (!isVehicle) return false;

      // Busca
      const s = debouncedSearchTerm.toLowerCase();
      const matchesSearch =
        !s ||
        (item.title && typeof item.title === 'string' && item.title.toLowerCase().includes(s)) ||
        searchInLocation(item.location, s);

      // Localização hierárquica (País -> Estado -> Cidade)
      let matchesLocation = true;
      if (filters.city) {
        // Se cidade está definida, filtra pela cidade
        matchesLocation = searchInLocation(item.location, filters.city);
      } else if (filters.state) {
        // Se apenas estado está definido, filtra pelo estado
        matchesLocation = searchInLocation(item.location, filters.state);
      }
      // Se apenas país (Brasil) está definido, mostra todos (não filtra)

      // Categoria de veículo
      const matchesCategory =
        filters.category === "all" ||
        (item.category && item.category.toLowerCase() === filters.category.toLowerCase()) ||
        (item.title && typeof item.title === 'string' && item.title.toLowerCase().includes(filters.category.toLowerCase()));

      // Combustível
      const matchesFuel =
        filters.fuel === "all" ||
        (item.details?.fuel && typeof item.details.fuel === 'string' && item.details.fuel.toLowerCase() === filters.fuel.toLowerCase());

      // Tipo de Carroceria
      const matchesBodyType =
        filters.bodyType === "all" ||
        (item.details?.bodyType && typeof item.details.bodyType === 'string' && item.details.bodyType.toLowerCase() === filters.bodyType.toLowerCase());

      // Câmbio
      const matchesTransmission =
        filters.transmission === "all" ||
        (item.details?.transmission && typeof item.details.transmission === 'string' && item.details.transmission.toLowerCase() === filters.transmission.toLowerCase());

      // Cor
      const matchesColor =
        filters.color === "all" ||
        (item.details?.color && typeof item.details.color === 'string' && item.details.color.toLowerCase() === filters.color.toLowerCase());

      // Número de Portas
      const matchesDoors =
        filters.doors === "all" ||
        (item.details?.doors && item.details.doors.toString() === filters.doors);

      // Tipo de negócio
      const matchesDealType =
        filters.dealType === "all" || item.dealType === filters.dealType;

      // Preço
      const priceValue = parsePrice(item.price);
      const matchesMinPrice =
        !filters.minPrice || priceValue >= parseFloat(filters.minPrice);
      const matchesMaxPrice =
        !filters.maxPrice || priceValue <= parseFloat(filters.maxPrice);

      // Ano
      let matchesYear = true;
      if (filters.specificYear) {
        // Se ano específico foi definido, só corresponde a esse ano
        matchesYear = item.details?.year && 
          parseInt(item.details.year) === parseInt(filters.specificYear);
      } else {
        // Caso contrário, usa o range de anos
        const matchesMinYear =
          !filters.minYear ||
          (item.details?.year &&
            parseInt(item.details.year) >= parseInt(filters.minYear));
        const matchesMaxYear =
          !filters.maxYear ||
          (item.details?.year &&
            parseInt(item.details.year) <= parseInt(filters.maxYear));
        matchesYear = matchesMinYear && matchesMaxYear;
      }

      // KM
      const kmValue = item.details?.km
        ? (typeof item.details.km === 'string' 
            ? parseInt(item.details.km.replace(/\D/g, "")) 
            : parseInt(item.details.km))
        : 999999;
      const matchesMinKm =
        !filters.minKm || kmValue >= parseInt(filters.minKm);
      const matchesMaxKm =
        !filters.maxKm || kmValue <= parseInt(filters.maxKm);
      const matchesKm = matchesMinKm && matchesMaxKm;

      return (
        matchesSearch &&
        matchesLocation &&
        matchesCategory &&
        matchesDealType &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesYear &&
        matchesKm &&
        matchesFuel &&
        matchesBodyType &&
        matchesTransmission &&
        matchesColor &&
        matchesDoors
      );
    });

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
        const priceA = typeof a.price === 'number' ? a.price : parseFloat(String(a.price).replace(/[^\d,]/g, "").replace(",", "."));
        const priceB = typeof b.price === 'number' ? b.price : parseFloat(String(b.price).replace(/[^\d,]/g, "").replace(",", "."));
        return priceA - priceB;
      });
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => {
        const priceA = typeof a.price === 'number' ? a.price : parseFloat(String(a.price).replace(/[^\d,]/g, "").replace(",", "."));
        const priceB = typeof b.price === 'number' ? b.price : parseFloat(String(b.price).replace(/[^\d,]/g, "").replace(",", "."));
        return priceB - priceA;
      });
    } else if (sortBy === "year-desc") {
      result.sort((a, b) => {
        const yearA = parseInt(a.details?.year || "0");
        const yearB = parseInt(b.details?.year || "0");
        return yearB - yearA;
      });
    } else if (sortBy === "km-asc") {
      result.sort((a, b) => {
        const kmA = a.details?.km 
          ? (typeof a.details.km === 'string' ? parseInt(a.details.km.replace(/\D/g, "")) : parseInt(a.details.km))
          : 999999;
        const kmB = b.details?.km 
          ? (typeof b.details.km === 'string' ? parseInt(b.details.km.replace(/\D/g, "")) : parseInt(b.details.km))
          : 999999;
        return kmA - kmB;
      });
    }

    return result;
  }, [debouncedSearchTerm, filters, sortBy, listings]);

  // Lista paginada para exibição
  const displayedListings = useMemo(() => {
    return filteredListings.slice(0, displayCount);
  }, [filteredListings, displayCount]);

  const hasMore = displayCount < filteredListings.length;

  const loadMore = useCallback(() => {
    setDisplayCount(prev => prev + 20);
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setDisplayCount(20); // Reset pagination when filters change
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      country: "Brasil",
      state: "",
      city: "",
      category: "all",
      dealType: "all",
      minPrice: "",
      maxPrice: "",
      minYear: "",
      maxYear: "",
      specificYear: "",
      minKm: "",
      maxKm: "",
      fuel: "all",
      bodyType: "all",
      transmission: "all",
      color: "all",
      doors: "all",
    });
  }, []);

  const hasActiveFilters =
    filters.state ||
    filters.city ||
    filters.category !== "all" ||
    filters.dealType !== "all" ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minYear ||
    filters.maxYear ||
    filters.specificYear ||
    filters.minKm ||
    filters.maxKm ||
    filters.fuel !== "all" ||
    filters.bodyType !== "all" ||
    filters.transmission !== "all" ||
    filters.color !== "all" ||
    filters.doors !== "all";

  // Mostrar loading enquanto carrega
  if (loading && listings.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">
            Carregando veículos
          </h3>
          <p className="text-slate-600 text-base">
            Estamos buscando os melhores veículos para você
          </p>
          <div className="mt-6 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

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
                    <Car size={20} />
                    <span className="font-bold">Veículos</span>
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
                placeholder="Buscar veículos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-400"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            </div>
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
                className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 bg-blue-600 text-white shadow-md"
              >
                <Car size={16} /> Veículos
              </button>

              <button
                onClick={() => navigate("/imoveis")}
                className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 text-slate-600 hover:bg-slate-50"
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
                  ? "flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all bg-blue-600 text-white shadow-lg"
                  : "flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
              }
            >
              <Filter size={18} />
              Filtros
              {hasActiveFilters && (
                <span className="ml-1 bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  !
                </span>
              )}
            </button>

            {/* Dropdown de Ordenacao */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 pr-10 rounded-xl font-semibold text-sm bg-white text-slate-700 border border-slate-200 hover:border-blue-400 hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="relevance" className="py-3">Mais relevantes</option>
                <option value="recent" className="py-3">Mais recentes</option>
                <option value="price-asc" className="py-3">Menor preco</option>
                <option value="price-desc" className="py-3">Maior preco</option>
                <option value="year-desc" className="py-3">Mais novo</option>
                <option value="km-asc" className="py-3">Menor KM</option>
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
                  <Car size={20} className="text-blue-600" />
                  Filtros para Veículos
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
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    {/* Cidade */}
                    <input
                      type="text"
                      placeholder="Cidade (Ex: Curitiba)"
                      value={filters.city}
                      onChange={(e) =>
                        handleFilterChange("city", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Categoria */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="all">Todos os veículos</option>
                    <option value="carro">Carro</option>
                    <option value="moto">Moto</option>
                    <option value="caminhao">Caminhão</option>
                    <option value="van">Van</option>
                    <option value="pickup">Pickup</option>
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
                            ? "bg-blue-600 text-white"
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
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Máximo"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        handleFilterChange("maxPrice", e.target.value)
                      }
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Ano */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    Ano
                  </label>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="De"
                        value={filters.minYear}
                        onChange={(e) => {
                          handleFilterChange("minYear", e.target.value);
                          if (e.target.value) {
                            handleFilterChange("specificYear", "");
                          }
                        }}
                        disabled={!!filters.specificYear}
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                      />
                      <input
                        type="number"
                        placeholder="Até"
                        value={filters.maxYear}
                        onChange={(e) => {
                          handleFilterChange("maxYear", e.target.value);
                          if (e.target.value) {
                            handleFilterChange("specificYear", "");
                          }
                        }}
                        disabled={!!filters.specificYear}
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Ou ano específico (Ex: 2020)"
                        value={filters.specificYear}
                        onChange={(e) => {
                          handleFilterChange("specificYear", e.target.value);
                          if (e.target.value) {
                            handleFilterChange("minYear", "");
                            handleFilterChange("maxYear", "");
                          }
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* KM */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Gauge size={16} className="inline mr-1" />
                    Quilometragem (KM)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="De"
                      value={filters.minKm}
                      onChange={(e) => handleFilterChange("minKm", e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Até"
                      value={filters.maxKm}
                      onChange={(e) => handleFilterChange("maxKm", e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Combustível */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Combustível
                  </label>
                  <select
                    value={filters.fuel}
                    onChange={(e) => handleFilterChange("fuel", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="all">Todos</option>
                    <option value="Flex">Flex</option>
                    <option value="Gasolina">Gasolina</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Elétrico">Elétrico</option>
                    <option value="Híbrido">Híbrido</option>
                  </select>
                </div>

                {/* Tipo de Carroceria */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tipo de Carroceria
                  </label>
                  <select
                    value={filters.bodyType}
                    onChange={(e) => handleFilterChange("bodyType", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="all">Todos</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Hatch">Hatch</option>
                    <option value="SUV">SUV</option>
                    <option value="Pickup">Pickup</option>
                    <option value="Van">Van</option>
                    <option value="Caminhonete">Caminhonete</option>
                    <option value="Conversível">Conversível</option>
                    <option value="Coupé">Coupé</option>
                    <option value="Minivan">Minivan</option>
                  </select>
                </div>

                {/* Câmbio */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Câmbio
                  </label>
                  <select
                    value={filters.transmission}
                    onChange={(e) => handleFilterChange("transmission", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="all">Todos</option>
                    <option value="Manual">Manual</option>
                    <option value="Automático">Automático</option>
                    <option value="Automatizado">Automatizado (CVT)</option>
                  </select>
                </div>

                {/* Cor */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Cor
                  </label>
                  <select
                    value={filters.color}
                    onChange={(e) => handleFilterChange("color", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="all">Todas</option>
                    <option value="Branco">Branco</option>
                    <option value="Preto">Preto</option>
                    <option value="Prata">Prata</option>
                    <option value="Cinza">Cinza</option>
                    <option value="Vermelho">Vermelho</option>
                    <option value="Azul">Azul</option>
                    <option value="Verde">Verde</option>
                    <option value="Amarelo">Amarelo</option>
                    <option value="Bege">Bege</option>
                    <option value="Marrom">Marrom</option>
                    <option value="Laranja">Laranja</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                {/* Número de Portas */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Número de Portas
                  </label>
                  <select
                    value={filters.doors}
                    onChange={(e) => handleFilterChange("doors", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="all">Todas</option>
                    <option value="2">2 portas</option>
                    <option value="4">4 portas</option>
                    <option value="5">5 portas</option>
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
                      className="w-full px-6 py-3 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 transition"
                    >
                      Aplicar filtros
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsFiltersOpen(false)}
                    className="col-span-2 w-full px-6 py-3 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 transition"
                  >
                    Aplicar filtros
                  </button>
                )}
              </div>
            </div>
          )}

          <ListingsGrid listings={displayedListings} loading={loading} />
          
          {hasMore && !loading && (
            <div className="flex justify-center mt-12 mb-8">
              <button
                onClick={loadMore}
                className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Carregar mais anúncios
              </button>
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
