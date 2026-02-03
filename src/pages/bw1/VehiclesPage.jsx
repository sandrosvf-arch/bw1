import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Car, Calendar, DollarSign, MapPin, Gauge, Filter, ArrowUpDown, Home as HomeIcon, Search, ArrowLeft } from "lucide-react";

import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import AppShell from "./components/AppShell";
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

export default function VehiclesPage() {
  const navigate = useNavigate();
  const [logoOk, setLogoOk] = React.useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [filters, setFilters] = useState({
    location: "",
    category: "all",
    dealType: "all",
    minPrice: "",
    maxPrice: "",
    minYear: "",
    maxKm: "",
  });

  const filteredListings = useMemo(() => {
    let result = listings.filter((item) => {
      // Apenas veículos
      if (item.type !== "vehicle") return false;

      // Busca
      const s = searchTerm.toLowerCase();
      const matchesSearch =
        !s ||
        item.title.toLowerCase().includes(s) ||
        item.location.toLowerCase().includes(s);

      // Localização
      const matchesLocation =
        !filters.location ||
        item.location.toLowerCase().includes(filters.location.toLowerCase());

      // Categoria de veículo
      const matchesCategory =
        filters.category === "all" ||
        item.title.toLowerCase().includes(filters.category.toLowerCase());

      // Tipo de negócio
      const matchesDealType =
        filters.dealType === "all" || item.tag === filters.dealType;

      // Preço
      const priceValue = parseFloat(
        item.price.replace(/[^\d,]/g, "").replace(",", ".")
      );
      const matchesMinPrice =
        !filters.minPrice || priceValue >= parseFloat(filters.minPrice);
      const matchesMaxPrice =
        !filters.maxPrice || priceValue <= parseFloat(filters.maxPrice);

      // Ano
      const matchesYear =
        !filters.minYear ||
        (item.details?.year &&
          parseInt(item.details.year) >= parseInt(filters.minYear));

      // KM
      const kmValue = item.details?.km
        ? parseInt(item.details.km.replace(/\D/g, ""))
        : 999999;
      const matchesKm =
        !filters.maxKm || kmValue <= parseInt(filters.maxKm);

      return (
        matchesSearch &&
        matchesLocation &&
        matchesCategory &&
        matchesDealType &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesYear &&
        matchesKm
      );
    });

    // Ordenação
    if (sortBy === "price-asc") {
      result.sort((a, b) => {
        const priceA = parseFloat(a.price.replace(/[^\d,]/g, "").replace(",", "."));
        const priceB = parseFloat(b.price.replace(/[^\d,]/g, "").replace(",", "."));
        return priceA - priceB;
      });
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => {
        const priceA = parseFloat(a.price.replace(/[^\d,]/g, "").replace(",", "."));
        const priceB = parseFloat(b.price.replace(/[^\d,]/g, "").replace(",", "."));
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
        const kmA = parseInt(a.details?.km?.replace(/\D/g, "") || "999999");
        const kmB = parseInt(b.details?.km?.replace(/\D/g, "") || "999999");
        return kmA - kmB;
      });
    }

    return result;
  }, [searchTerm, filters, sortBy]);

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setFilters({
      location: "",
      category: "all",
      dealType: "all",
      minPrice: "",
      maxPrice: "",
      minYear: "",
      maxKm: "",
    });
  };

  const hasActiveFilters =
    filters.location ||
    filters.category !== "all" ||
    filters.dealType !== "all" ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minYear ||
    filters.maxKm;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 relative">
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-20 pb-28 lg:pb-8 pt-6">
          {/* Barra de busca */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Buscar veículos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-400"
              />
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
                <Car size={16} /> Veiculos
              </button>

              <button
                onClick={() => navigate("/imoveis")}
                className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 text-slate-600 hover:bg-slate-50"
              >
                <HomeIcon size={16} /> Imoveis
              </button>
            </div>
          </div>

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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Car size={20} className="text-blue-600" />
                  Filtros para Veiculos
                </h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Localização (Buscando em) */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <MapPin size={16} className="inline mr-1" />
                    Buscando em
                  </label>
                  <input
                    type="text"
                    placeholder="Paraná"
                    value={filters.location}
                    onChange={(e) =>
                      handleFilterChange("location", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
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
                    <option value="all">Carros, vans e utilitários</option>
                    <option value="carro">Carros</option>
                    <option value="van">Vans</option>
                    <option value="utilitário">Utilitários</option>
                    <option value="suv">SUVs</option>
                    <option value="pickup">Picapes</option>
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

                {/* Ano mínimo */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    Ano mínimo
                  </label>
                  <input
                    type="number"
                    placeholder="Ex: 2020"
                    value={filters.minYear}
                    onChange={(e) =>
                      handleFilterChange("minYear", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* KM máxima */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Gauge size={16} className="inline mr-1" />
                    KM máxima
                  </label>
                  <input
                    type="number"
                    placeholder="Ex: 50000"
                    value={filters.maxKm}
                    onChange={(e) => handleFilterChange("maxKm", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          <ListingsGrid listings={filteredListings} />
          <CTA />
          <Footer brand={BRAND} footer={FOOTER} />
        </main>

        <BottomNav />
      </AppShell>
    </div>
  );
}
