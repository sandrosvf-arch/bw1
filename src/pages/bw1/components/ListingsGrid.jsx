import React from "react";
import { Search } from "lucide-react";
import ListingCard from "./ListingCard";

export default function ListingsGrid({ listings, onViewMore }) {
  if (!listings || listings.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="text-slate-400" size={32} />
        </div>
        <h3 className="text-lg font-medium text-slate-900">
          Nenhum resultado encontrado
        </h3>
        <p className="text-slate-500">
          Tente ajustar seus termos de busca ou filtros.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {listings.map((item) => (
        <ListingCard key={item.id} item={item} onViewMore={onViewMore} />
      ))}
    </div>
  );
}
