import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";

import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import AppShell from "./components/AppShell";
import ListingsGrid from "./components/ListingsGrid";
import Footer from "./components/Footer";
import api from "../../services/api";

import * as BrandMod from "./content/brand.js";
import * as NavMod from "./content/navigation.js";
import * as FooterMod from "./content/footer.js";

const BRAND = BrandMod.default ?? BrandMod.BRAND;
const NAVIGATION = NavMod.default ?? NavMod.NAVIGATION;
const FOOTER = FooterMod.default ?? FooterMod.FOOTER;

function parsePrice(price) {
  if (typeof price === 'number') return price;
  if (typeof price === 'string') {
    return parseFloat(price.replace(/[^\d,]/g, "").replace(",", "."));
  }
  return 0;
}

function searchInLocation(location, term) {
  if (!location || !term) return false;
  const t = term.toLowerCase();
  if (typeof location === 'string') return location.toLowerCase().includes(t);
  if (typeof location === 'object') {
    return (location.city || '').toLowerCase().includes(t) ||
           (location.state || '').toLowerCase().includes(t) ||
           (location.neighborhood || '').toLowerCase().includes(t);
  }
  return false;
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [committedSearchTerm, setCommittedSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [apiListings, setApiListings] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: "all", // all, vehicle, property
    minPrice: "",
    maxPrice: "",
    location: "",
  });

  const handleSearchSubmit = useCallback(async () => {
    const term = searchTerm.trim();
    setCommittedSearchTerm(term);
    setIsSearching(true);
    setHasSearched(true);
    try {
      const categoryMap = { vehicle: 'vehicle', property: 'property' };
      const params = { limit: 50, ...(term ? { search: term } : {}) };
      if (filters.type !== 'all' && categoryMap[filters.type]) {
        params.category = categoryMap[filters.type];
      }
      const response = await api.getListings(params, { forceRefresh: true });
      setApiListings(response.listings || []);
    } catch (err) {
      console.error('Erro na busca:', err);
      setApiListings([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchTerm, filters.type]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') handleSearchSubmit();
  };

  const filteredListings = useMemo(() => {
    let result = [...apiListings];

    // Tipo
    if (filters.type !== "all") {
      result = result.filter(
        (item) => item.category === filters.type || item.type === filters.type
      );
    }

    // Preço
    const minPrice = parseFloat(filters.minPrice) || 0;
    const maxPrice = parseFloat(filters.maxPrice) || Infinity;
    result = result.filter((item) => {
      const price = parsePrice(item.price);
      return price >= minPrice && price <= maxPrice;
    });

    // Localização
    if (filters.location) {
      result = result.filter((item) =>
        searchInLocation(item.location, filters.location)
      );
    }

    return result;
  }, [apiListings, filters]);

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
    setCommittedSearchTerm("");
    setApiListings([]);
    setHasSearched(false);
  };

  const hasActiveFilters =
    filters.type !== "all" ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.location ||
    committedSearchTerm;

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
              <input
                type="text"
                placeholder="O que você está procurando?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full py-4 pl-4 pr-28 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-400 text-lg"
                autoFocus
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchTerm && (
                  <button
                    onClick={clearFilters}
                    className="p-1 text-slate-400 hover:text-slate-600 transition"
                    title="Limpar"
                  >
                    <X size={20} />
                  </button>
                )}
                <button
                  onClick={handleSearchSubmit}
                  disabled={isSearching}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-semibold text-sm transition"
                >
                  {isSearching ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <Search size={16} />
                  )}
                  Buscar
                </button>
              </div>
            </div>
            {committedSearchTerm && (
              <p className="mt-2 text-sm text-slate-500">
                Resultados para: <span className="font-semibold text-slate-700">"{committedSearchTerm}"</span>
              </p>
            )}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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

              {/* Botão Aplicar Filtros */}
              <div className="flex justify-end gap-3">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 rounded-xl font-semibold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                  >
                    Limpar filtros
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-6 py-3 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 transition"
                >
                  Aplicar filtros
                </button>
              </div>
            </div>
          )}

          {/* Resultados */}
          <div className="mb-6">
            {!hasSearched ? (
              <p className="text-slate-500">Digite sua busca acima e clique em <span className="font-semibold">Buscar</span> para encontrar anúncios.</p>
            ) : filteredListings.length === 0 ? (
              <p className="font-semibold text-slate-900">Nenhum resultado encontrado para "{committedSearchTerm}".</p>
            ) : (
              <p className="text-slate-600">
                <span className="font-semibold text-slate-900">{filteredListings.length}</span>{" "}
                {filteredListings.length === 1 ? "anúncio encontrado" : "anúncios encontrados"}
              </p>
            )}
          </div>

          <ListingsGrid listings={filteredListings} />
        </main>

        <Footer brand={BRAND} footer={FOOTER} />
        <BottomNav />
      </AppShell>
    </div>
  );
}
