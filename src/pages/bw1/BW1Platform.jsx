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

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const matchesTab =
        activeTab === "all" ||
        item.type === (activeTab === "vehicles" ? "vehicle" : "property");

      const s = searchTerm.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(s) ||
        item.location.toLowerCase().includes(s);

      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchTerm]);

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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-20 pb-28 lg:pb-8 -mt-16">
          <Tabs activeTab={activeTab} onChange={setActiveTab} />
          <ListingsGrid listings={filteredListings} />
          <CTA />
          <Footer brand={BRAND} footer={FOOTER} />
        </main>

        {/* ✅ Barra inferior flutuante */}
        <BottomNav />
      </AppShell>
    </div>
  );
}
