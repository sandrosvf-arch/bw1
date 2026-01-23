import React from "react";
import { Car, Home } from "lucide-react";

export default function Tabs({ activeTab, onChange }) {
  return (
    <div className="flex justify-center mb-8">
      <div className="bg-white p-1.5 rounded-2xl shadow-lg inline-flex">
        <button
          onClick={() => onChange("all")}
          className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === "all"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Todos
        </button>

        <button
          onClick={() => onChange("vehicles")}
          className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === "vehicles"
              ? "bg-blue-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Car size={16} /> Veículos
        </button>

        <button
          onClick={() => onChange("properties")}
          className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === "properties"
              ? "bg-blue-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Home size={16} /> Imóveis
        </button>
      </div>
    </div>
  );
}
