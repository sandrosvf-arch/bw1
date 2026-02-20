import React, { useMemo, useState, useEffect, useRef } from "react";
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
  const [ordering, setOrdering] = useState("recent");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const observerRef = useRef(null);

  // Carregar os primeiros 4 anúncios
  useEffect(() => {
    loadInitialListings();
  }, []);

  const loadInitialListings = async () => {
    setLoading(true);
    try {
      const response = await api.getListings({ limit: BATCH_SIZE, offset: 0 });
      const newListings = response.listings || [];
      setListings(newListings);
      setOffset(BATCH_SIZE);
      setHasMore(newListings.length === BATCH_SIZE);
    } catch (error) {
      console.error('Erro ao carregar anúncios:', error);
      setListings([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // Função para carregar mais 4 anúncios
  const loadMoreListings = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const response = await api.getListings({ limit: BATCH_SIZE, offset });
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

  // Intersection Observer para detectar quando o usuário chega ao fim da página
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
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

  const filteredListings = useMemo(() => {
    let filtered = listings.filter((item) => {
      const s = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        item.title.toLowerCase().includes(s) ||
        (item.location?.city || item.location || '').toLowerCase().includes(s) ||
        (item.location?.state || '').toLowerCase().includes(s);

      return matchesSearch;
    });

    if (ordering === "price-asc") {
      filtered = [...filtered].sort((a, b) => {
        const priceA = typeof a.price === "number" ? a.price : parseFloat(String(a.price).replace(/[^0-9]/g, "")) || 0;
        const priceB = typeof b.price === "number" ? b.price : parseFloat(String(b.price).replace(/[^0-9]/g, "")) || 0;
        return priceA - priceB;
      });
    } else if (ordering === "price-desc") {
      filtered = [...filtered].sort((a, b) => {
        const priceA = typeof a.price === "number" ? a.price : parseFloat(String(a.price).replace(/[^0-9]/g, "")) || 0;
        const priceB = typeof b.price === "number" ? b.price : parseFloat(String(b.price).replace(/[^0-9]/g, "")) || 0;
        return priceB - priceA;
      });
    }

    return filtered;
  }, [searchTerm, ordering, listings]);

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
          <Hero hero={HERO} searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-28 lg:pb-8 -mt-16">
            <div className="flex items-center justify-center py-16">
              <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                <div className="mb-6">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
        <Hero hero={HERO} searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        {/* ✅ padding-bottom grande pra não ficar nada escondido atrás da BottomNav */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-28 lg:pb-8 -mt-16">
          <Tabs />
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Todos os anúncios</h2>
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
          
          <ListingsGrid listings={filteredListings} loading={false} />
          
          {/* Observer target para scroll infinito */}
          {hasMore && <div ref={observerRef} className="h-4" />}
          
          {/* Indicador de carregamento de mais anúncios */}
          {loadingMore && (
            <div className="flex items-center justify-center py-12">
              <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                <div className="mb-6">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
          
          {/* Mensagem quando não há mais anúncios */}
          {!hasMore && listings.length > 0 && (
            <div className="text-center py-8">
              <p className="text-slate-500">Não há mais anúncios para exibir</p>
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
