import React from "react";
import { Car, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Tabs({ activeTab, onChange }) {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isVehicles = location.pathname === "/veiculos";
  const isProperties = location.pathname === "/imoveis";

  return (
    <div className="flex justify-center mb-4">
      <div className="bg-white p-1.5 rounded-2xl shadow-lg inline-flex">
        <Link
          to="/"
          className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isHome
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Todos
        </Link>

        <Link
          to="/veiculos"
          className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            isVehicles
              ? "bg-blue-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Car size={16} /> Veículos
        </Link>

        <Link
          to="/imoveis"
          className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            isProperties
              ? "bg-blue-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Home size={16} /> Imóveis
        </Link>
      </div>
    </div>
  );
}
