import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";

import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import AppShell from "./components/AppShell";
import ListingsGrid from "./components/ListingsGrid";
import Footer from "./components/Footer";

import * as BrandMod from "./content/brand.js";
import * as NavMod from "./content/navigation.js";
import * as FooterMod from "./content/footer.js";

import listings from "./data/listings.js";

const BRAND = BrandMod.default ?? BrandMod.BRAND;
const NAVIGATION = NavMod.default ?? NavMod.NAVIGATION;
const FOOTER = FooterMod.default ?? FooterMod.FOOTER;

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: "all", // all, vehicle, property
    minPrice: "",
    maxPrice: "",
    location: "",
  });

  const filteredListings = useMemo(() => {
    let result = [...listings];

    // Busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(term) ||
          item.location.toLowerCase().includes(term)
      );
    }

    // Tipo
    if (filters.type !== "all") {
      result = result.filter((item) => item.type === filters.type);
    }

    // Preço
    const minPrice = parseFloat(filters.minPrice) || 0;
    const maxPrice = parseFloat(filters.maxPrice) || Infinity;
    result = result.filter((item) => {
      const price = parseFloat(
        item.price.replace(/[^\d,]/g, "").replace(",", ".")
      );
      return price >= minPrice && price <= maxPrice;
    });

    // Localização
    if (filters.location) {
      result = result.filter((item) =>
        item.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    return result;
  }, [searchTerm, filters]);

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setFilters({
      type: "all",
      minPrice: "",
      maxPrice: "",
      location: "",
    });
    setSearchTerm("");
  };

  const hasActiveFilters =
    filters.type !== "all" ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.location ||
    searchTerm;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <AppShell
        header={
          <Navbar
            brand={BRAND}
            links={NAVIGATION?.links || []}
            cta={NAVIGATION?.cta}
          />
        }
      >
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 lg:pb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">
            Buscar anúncios
          </h1>

          {/* Barra de busca principal */}
          <div className="mb-6">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="O que você está procurando?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-12 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-400 text-lg"
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Filtros rápidos */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition ${
                showFilters
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
              }`}
            >
              <SlidersHorizontal size={18} />
              Filtros
            </button>

            {["all", "vehicle", "property"].map((type) => (
              <button
                key={type}
                onClick={() => handleFilterChange("type", type)}
                className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition ${
                  filters.type === type
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {type === "all"
                  ? "Todos"
                  : type === "vehicle"
                  ? "Veículos"
                  : "Imóveis"}
              </button>
            ))}

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                Limpar tudo
              </button>
            )}
          </div>

          {/* Painel de filtros avançados */}
          {showFilters && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Filtros avançados
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Preço mínimo
                  </label>
                  <input
                    type="number"
                    placeholder="R$ 0"
                    value={filters.minPrice}
                    onChange={(e) =>
                      handleFilterChange("minPrice", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Preço máximo
                  </label>
                  <input
                    type="number"
                    placeholder="R$ 1.000.000"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      handleFilterChange("maxPrice", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Localização
                  </label>
                  <input
                    type="text"
                    placeholder="Cidade ou estado"
                    value={filters.location}
                    onChange={(e) =>
                      handleFilterChange("location", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Resultados */}
          <div className="mb-6">
            <p className="text-slate-600">
              {filteredListings.length === 0 ? (
                <span className="font-semibold text-slate-900">
                  Nenhum resultado encontrado
                </span>
              ) : (
                <>
                  <span className="font-semibold text-slate-900">
                    {filteredListings.length}
                  </span>{" "}
                  {filteredListings.length === 1
                    ? "anúncio encontrado"
                    : "anúncios encontrados"}
                </>
              )}
            </p>
          </div>

          <ListingsGrid listings={filteredListings} />
        </main>

        <Footer brand={BRAND} footer={FOOTER} />
        <BottomNav />
      </AppShell>
    </div>
  );
}
