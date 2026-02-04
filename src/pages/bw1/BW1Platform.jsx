import React, { useMemo, useState } from "react";

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

import listings from "./data/listings.js";

const BRAND = BrandMod.default ?? BrandMod.BRAND;
const NAVIGATION = NavMod.default ?? NavMod.NAVIGATION;
const HERO = HeroMod.default ?? HeroMod.HERO;
const FOOTER = FooterMod.default ?? FooterMod.FOOTER;

export default function BW1Platform() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [ordering, setOrdering] = useState("recent");

  const filteredListings = useMemo(() => {
    let filtered = listings.filter((item) => {
      const matchesTab =
        activeTab === "all" ||
        item.type === (activeTab === "vehicles" ? "vehicle" : "property");

      const s = searchTerm.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(s) ||
        item.location.toLowerCase().includes(s);

      return matchesTab && matchesSearch;
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
  }, [activeTab, searchTerm, ordering]);

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
          <Tabs activeTab={activeTab} onChange={setActiveTab} />
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
          <ListingsGrid listings={filteredListings} />
          <CTA />
        </main>

        <Footer brand={BRAND} footer={FOOTER} />
        {/* ✅ Barra inferior flutuante */}
        <BottomNav />
      </AppShell>
    </div>
  );
}
