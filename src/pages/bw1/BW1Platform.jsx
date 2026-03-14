import React, { useMemo, useState, useEffect, useRef } from "react";
import { MapPin, ChevronDown, Check } from "lucide-react";
import api from "../../services/api";

import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import AppShell from "./components/AppShell";
import Hero from "./components/Hero";
import Tabs from "./components/Tabs";
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
const BATCH_SIZE = 4;

export default function BW1Platform() {
  const { showTermsModal, handleAcceptTerms } = useTermsModal();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [committedSearchTerm, setCommittedSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [ordering, setOrdering] = useState("recent");
  const [selectedState, setSelectedState] = useState("");
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [availableStates, setAvailableStates] = useState([]);
  const stateDropdownRef = useRef(null);
  const selectedStateRef = useRef("");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const observerRef = useRef(null);
  const searchModeRef = useRef(false);

  // Carregar estados do banco na inicialização (sempre fresh)
  useEffect(() => {
    // Limpa cache antigo de estados para evitar lista desatualizada
    try {
      Object.keys(localStorage).forEach(k => {
        if (k.includes('listings/states')) localStorage.removeItem(k);
      });
    } catch {}
    api.getListingStates().then(res => {
      setAvailableStates(res.states || []);
    }).catch(() => {});
  }, []);

  // Carregar os primeiros anúncios
  useEffect(() => {
    loadInitialListings();
  }, []);

  const buildParams = (extra = {}) => {
    const params = { limit: BATCH_SIZE, ...extra };
    if (selectedStateRef.current) params.state = selectedStateRef.current;
    return params;
  };

  const loadInitialListings = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const response = await api.getListings(buildParams({ offset: 0 }), { forceRefresh: true });
      const newListings = response.listings || [];
      setListings(newListings);
      setOffset(BATCH_SIZE);
      setHasMore(newListings.length === BATCH_SIZE);
    } catch (error) {
      console.error('Erro ao carregar anúncios:', error);
      setListings([]);
      setLoadError(true);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // Recarregar ao mudar o estado selecionado
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    selectedStateRef.current = selectedState;
    searchModeRef.current = false;
    setCommittedSearchTerm("");
    setSearchTerm("");
    setLoading(true);
    api.getListings(buildParams({ offset: 0 }), { forceRefresh: true })
      .then(res => {
        const newListings = res.listings || [];
        setListings(newListings);
        setOffset(BATCH_SIZE);
        setHasMore(newListings.length === BATCH_SIZE);
      })
      .catch(() => { setListings([]); setHasMore(false); })
      .finally(() => setLoading(false));
  }, [selectedState]);

  // Busca por submissão (lupa ou Enter)
  const handleSearchSubmit = async () => {
    if (isSearching) return;
    const term = searchTerm.trim();
    if (term === committedSearchTerm) return;
    setCommittedSearchTerm(term);
    searchModeRef.current = !!term;
    setIsSearching(true);
    try {
      const params = { ...(term ? { search: term } : {}), limit: 100 };
      if (selectedStateRef.current) params.state = selectedStateRef.current;
      const response = await api.getListings(params, { forceRefresh: true });
      const fetched = response.listings || [];
      setListings(fetched);
      if (term) {
        setOffset(fetched.length);
        setHasMore(false);
      } else {
        setOffset(BATCH_SIZE);
        setHasMore(fetched.length === BATCH_SIZE);
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
    searchModeRef.current = false;
    setIsSearching(true);
    try {
      const response = await api.getListings(buildParams({ offset: 0 }), { forceRefresh: true });
      const fetched = response.listings || [];
      setListings(fetched);
      setOffset(BATCH_SIZE);
      setHasMore(fetched.length === BATCH_SIZE);
    } catch (err) {
      console.error('Erro ao limpar busca:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Função para carregar mais anúncios (só quando não há busca ativa)
  const loadMoreListings = async () => {
    if (loadingMore || !hasMore || searchModeRef.current) return;

    setLoadingMore(true);
    try {
      const response = await api.getListings(buildParams({ offset }));
      const newListings = response.listings || [];
      
      if (newListings.length > 0) {
        setListings(prev => [...prev, ...newListings]);
        setOffset(prev => prev + BATCH_SIZE);
        setHasMore(newListings.length === BATCH_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Erro ao carregar mais anúncios:', error);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  // Intersection Observer — desativado durante busca ativa
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading && !searchModeRef.current) {
          loadMoreListings();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasMore, loadingMore, loading, offset]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(e.target)) {
        setStateDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayedListings = useMemo(() => {
    let filtered = [...listings];

    if (ordering === "price-asc") {
      filtered.sort((a, b) => {
        const priceA = typeof a.price === "number" ? a.price : parseFloat(String(a.price).replace(/[^0-9]/g, "")) || 0;
        const priceB = typeof b.price === "number" ? b.price : parseFloat(String(b.price).replace(/[^0-9]/g, "")) || 0;
        return priceA - priceB;
      });
    } else if (ordering === "price-desc") {
      filtered.sort((a, b) => {
        const priceA = typeof a.price === "number" ? a.price : parseFloat(String(a.price).replace(/[^0-9]/g, "")) || 0;
        const priceB = typeof b.price === "number" ? b.price : parseFloat(String(b.price).replace(/[^0-9]/g, "")) || 0;
        return priceB - priceA;
      });
    }

    return filtered;
  }, [ordering, listings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-800 relative">
        <AppShell
          header={
            <Navbar
              brand={BRAND}
              links={NAVIGATION?.links || []}
              cta={NAVIGATION?.cta}
            />
          }
        >
          <Hero hero={HERO} searchTerm={searchTerm} onSearchChange={setSearchTerm} onSearchSubmit={handleSearchSubmit} onSearchKeyDown={handleSearchKeyDown} />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-28 lg:pb-8 -mt-16">
            <div className="flex items-center justify-center py-16">
              <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                <div className="mb-6">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  Carregando anúncios
                </h3>
                <p className="text-slate-600 text-base">
                  Estamos buscando os melhores anúncios para você
                </p>
                <div className="mt-6 flex justify-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </main>
        </AppShell>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 relative">
      <TermsModal isOpen={showTermsModal} onAccept={handleAcceptTerms} />
      
      <AppShell
        header={
          <Navbar
            brand={BRAND}
            links={NAVIGATION?.links || []}
            cta={NAVIGATION?.cta}
          />
        }
      >
        <Hero hero={HERO} searchTerm={searchTerm} onSearchChange={setSearchTerm} onSearchSubmit={handleSearchSubmit} onSearchKeyDown={handleSearchKeyDown} onSearchClear={handleClearSearch} committedSearchTerm={committedSearchTerm} />

        {/* ✅ padding-bottom grande pra não ficar nada escondido atrás da BottomNav */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-28 lg:pb-8 -mt-16">
          <Tabs />

          {/* Barra de filtros */}
          <div className="flex items-center justify-between mb-6 gap-3">
            {/* Filtro de estado — dropdown */}
            <div className="relative" ref={stateDropdownRef}>
              <button
                onClick={() => setStateDropdownOpen((v) => !v)}
                className={`inline-flex items-center gap-2 pl-3 pr-2.5 py-2 rounded-xl text-sm font-medium border shadow-sm transition ${
                  selectedState
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <MapPin size={14} className={selectedState ? "text-white" : "text-slate-400"} />
                {selectedState || "Todos os estados"}
                <ChevronDown
                  size={15}
                  className={`transition-transform ${stateDropdownOpen ? "rotate-180" : ""} ${selectedState ? "text-white/80" : "text-slate-400"}`}
                />
              </button>

              {stateDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 overflow-hidden">
                  <button
                    onClick={() => { setSelectedState(""); setStateDropdownOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition ${
                      selectedState === "" ? "text-blue-600 font-semibold bg-blue-50" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Todos os estados
                    {selectedState === "" && <Check size={15} className="text-blue-600" />}
                  </button>
                  {availableStates.length === 0 && (
                    <p className="px-4 py-2.5 text-xs text-slate-400">Nenhum estado disponível</p>
                  )}
                  {availableStates.map((uf) => (
                    <button
                      key={uf}
                      onClick={() => { setSelectedState(uf === selectedState ? "" : uf); setStateDropdownOpen(false); }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition ${
                        selectedState === uf ? "text-blue-600 font-semibold bg-blue-50" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {uf}
                      {selectedState === uf && <Check size={15} className="text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Ordenação */}
            <select
              value={ordering}
              onChange={(e) => setOrdering(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white text-slate-700 font-medium text-sm border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50 transition"
            >
              <option value="recent">Mais recentes</option>
              <option value="relevant">Mais relevantes</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
            </select>
          </div>
          
          {isSearching ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <svg className="w-8 h-8 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <p className="text-slate-500 text-sm">Buscando anúncios...</p>
              </div>
            </div>
          ) : loadError ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
              <p className="text-slate-500 mb-4">Não foi possível carregar os anúncios. Verifique sua conexão.</p>
              <button onClick={loadInitialListings} className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">
                Tentar novamente
              </button>
            </div>
          ) : (
            <ListingsGrid listings={displayedListings} loading={false} />
          )}
          
          {/* Observer target para scroll infinito — desativado durante busca */}
          {hasMore && !searchModeRef.current && <div ref={observerRef} className="h-4" />}
          
          {/* Indicador de carregamento de mais anúncios */}
          {loadingMore && (
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
                  Carregando anúncios
                </h3>
                <p className="text-slate-600 text-base">
                  Estamos buscando os melhores anúncios para você
                </p>
                <div className="mt-6 flex justify-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          {/* Divisor elegante ao chegar ao fim dos resultados */}
          {!hasMore && listings.length > 0 && (
            <div className="flex items-center gap-4 pt-12 pb-0">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="flex items-center gap-2 text-slate-400 text-sm">
                <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Você viu todos os anúncios
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
          )}
          
          <CTA />
        </main>

        <Footer brand={BRAND} footer={FOOTER} />
        {/* ✅ Barra inferior flutuante */}
        <BottomNav />
      </AppShell>
    </div>
  );
}
