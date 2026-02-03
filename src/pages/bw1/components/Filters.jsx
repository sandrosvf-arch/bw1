import React from "react";
import { Filter, X, DollarSign, MapPin, Calendar } from "lucide-react";

export default function Filters({ filters, onFiltersChange, isOpen, onToggle }) {
  const handleChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      dealType: "all",
      minPrice: "",
      maxPrice: "",
      city: "",
      year: "",
    });
  };

  const hasActiveFilters = 
    filters.dealType !== "all" || 
    filters.minPrice || 
    filters.maxPrice || 
    filters.city || 
    filters.year;

  return (
    <div className="relative w-full sm:w-auto">
      {/* Botão para abrir filtros */}
      <button
        onClick={onToggle}
        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
          isOpen || hasActiveFilters
            ? "bg-blue-600 text-white shadow-lg"
            : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
        }`}
      >
        <Filter size={18} />
        Filtros
        {hasActiveFilters && (
          <span className="ml-1 bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            !
          </span>
        )}
      </button>

      {/* Painel de filtros */}
      {isOpen && (
        <div className="fixed inset-0 sm:absolute sm:inset-auto sm:top-full sm:right-0 sm:mt-2 sm:w-80 bg-white sm:rounded-2xl shadow-2xl sm:border border-slate-200 p-6 z-50 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Filtros</h3>
            <button
              onClick={onToggle}
              className="p-1 hover:bg-slate-100 rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Tipo de negócio */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tipo de negócio
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["all", "Venda", "Aluguel"].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleChange("dealType", type)}
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
                Faixa de preço
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Mín"
                  value={filters.minPrice}
                  onChange={(e) => handleChange("minPrice", e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="Máx"
                  value={filters.maxPrice}
                  onChange={(e) => handleChange("maxPrice", e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Cidade */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <MapPin size={16} className="inline mr-1" />
                Cidade
              </label>
              <input
                type="text"
                placeholder="Ex: São Paulo"
                value={filters.city}
                onChange={(e) => handleChange("city", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Ano (para veículos) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                Ano mínimo
              </label>
              <input
                type="number"
                placeholder="Ex: 2020"
                value={filters.year}
                onChange={(e) => handleChange("year", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-2 mt-6 pt-4 border-t">
            <button
              onClick={clearFilters}
              className="flex-1 py-2 px-4 rounded-lg text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              Limpar
            </button>
            <button
              onClick={onToggle}
              className="flex-1 py-2 px-4 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
