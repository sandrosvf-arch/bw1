import React, { useMemo, useState, useEffect } from "react";
import api from "../../services/api";

import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import AppShell from "./components/AppShell";
import Hero from "./components/Hero";
import Tabs from "./components/Tabs";
import ListingsGrid from "./components/ListingsGrid";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

import * as BrandMod from "./content/brand.js";
import * as NavMod from "./content/navigation.js";
import * as HeroMod from "./content/hero.js";
import * as FooterMod from "./content/footer.js";

const BRAND = BrandMod.default ?? BrandMod.BRAND;
const NAVIGATION = NavMod.default ?? NavMod.NAVIGATION;
const HERO = HeroMod.default ?? HeroMod.HERO;
const FOOTER = FooterMod.default ?? FooterMod.FOOTER;
const HOME_SNAPSHOT_KEY = "bw1_home_snapshot_v1";
const HOME_SNAPSHOT_MAX_AGE = 24 * 60 * 60 * 1000;
const INITIAL_RENDER_COUNT = 8;
const RENDER_BATCH_SIZE = 12;
const RENDER_BATCH_DELAY = 40;

function getHomeSnapshot() {
  try {
    const raw = localStorage.getItem(HOME_SNAPSHOT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!parsed?.timestamp || !Array.isArray(parsed?.listings)) return [];
    if (Date.now() - parsed.timestamp > HOME_SNAPSHOT_MAX_AGE) return [];
    return parsed.listings;
  } catch {
    return [];
  }
}

function saveHomeSnapshot(nextListings = []) {
  try {
    localStorage.setItem(
      HOME_SNAPSHOT_KEY,
      JSON.stringify({ timestamp: Date.now(), listings: nextListings.slice(0, 40) })
    );
  } catch {
    // noop
  }
}

export default function BW1Platform() {
  // Otimização: priorizar snapshot local, depois cache, depois vazio
  const snapshotListings = getHomeSnapshot();
  const initialCached = api.getListingsFromCache();
  const initialListings = snapshotListings?.length > 0
    ? snapshotListings
    : (initialCached?.listings?.length ? initialCached.listings : []);
  const [searchTerm, setSearchTerm] = useState("");
  const [ordering, setOrdering] = useState("recent");
  const [listings, setListings] = useState(initialListings);
  const [loading, setLoading] = useState(!(initialListings?.length > 0));
  const [visibleCount, setVisibleCount] = useState(INITIAL_RENDER_COUNT);

  useEffect(() => {
    // Se não há snapshot, tenta criar um snapshot rápido para o próximo acesso
    if (!snapshotListings?.length) {
      (async () => {
        try {
          const fastResponse = await api.getListings({ limit: INITIAL_RENDER_COUNT }, { forceRefresh: true });
          const fastListings = fastResponse.listings || [];
          if (fastListings.length > 0) {
            saveHomeSnapshot(fastListings);
            setListings(fastListings);
            setLoading(false);
          }
        } catch {}
      })();
    }
    loadListings();
  }, []);

  const loadListings = async () => {
    const cached = api.getListingsFromCache();
    const hasCached = cached?.listings?.length > 0;
    const hasLocalSnapshot = snapshotListings.length > 0;

    // Se já tem snapshot, não precisa mostrar loading
    if (hasLocalSnapshot) {
      setListings(snapshotListings);
      setLoading(false);
    } else if (hasCached) {
      setListings(cached.listings);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      // Sempre buscar uma versão rápida para atualizar snapshot/local
      const fastResponse = await api.getListings({ limit: INITIAL_RENDER_COUNT }, { forceRefresh: true });
      const fastListings = fastResponse.listings || [];
      if (fastListings.length > 0) {
        setListings(fastListings);
        saveHomeSnapshot(fastListings);
      }

      // Depois busca o full (em background)
      const fullResponse = await api.getListings({}, { forceRefresh: true });
      const fullListings = fullResponse.listings || [];
      setListings(fullListings);
      saveHomeSnapshot(fullListings);
    } catch (error) {
      console.error('Erro ao carregar anúncios da API:', error);
      if (!hasCached && !hasLocalSnapshot) {
        setListings([]);
      }
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    const total = filteredListings.length;
    const initial = Math.min(INITIAL_RENDER_COUNT, total || INITIAL_RENDER_COUNT);
    setVisibleCount(initial);

    if (total <= initial) return;

    const timer = setInterval(() => {
      setVisibleCount((prev) => {
        const next = Math.min(prev + RENDER_BATCH_SIZE, total);
        if (next >= total) {
          clearInterval(timer);
        }
        return next;
      });
    }, RENDER_BATCH_DELAY);

    return () => clearInterval(timer);
  }, [filteredListings]);

  const visibleListings = useMemo(() => {
    return filteredListings.slice(0, visibleCount);
  }, [filteredListings, visibleCount]);

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
            <div className="text-center py-12">
              <p className="text-slate-600">Carregando anúncios...</p>
            </div>
          </main>
        </AppShell>
        <BottomNav />
      </div>
    );
  }

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
          <ListingsGrid listings={visibleListings} loading={loading} />
          {visibleCount < filteredListings.length && (
            <div className="text-center text-sm text-slate-500 mt-4">Carregando mais anúncios...</div>
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
