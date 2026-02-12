import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function DebugListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await api.getListings({});
      console.log('TODOS os anúncios do banco:', response.listings);
      setListings(response.listings || []);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">🔍 Debug - Anúncios do Banco</h1>
      
      <div className="bg-white rounded-lg p-4 mb-4">
        <p className="text-sm text-slate-600 mb-2">
          Total de anúncios: <strong>{listings.length}</strong>
        </p>
        <button 
          onClick={loadData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🔄 Recarregar
        </button>
      </div>

      <div className="space-y-4">
        {listings.map((listing) => (
          <div key={listing.id} className="bg-white rounded-lg p-6 border-2 border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{listing.title}</h2>
                <p className="text-sm text-slate-500">ID: {listing.id}</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                  {listing.type}
                </span>
                {listing.dealType && (
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold ml-2">
                    {listing.dealType}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-slate-500">Categoria</p>
                <p className="font-semibold">{listing.category}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Preço</p>
                <p className="font-semibold">{listing.price}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Localização</p>
                <p className="font-semibold">
                  {typeof listing.location === 'object' 
                    ? `${listing.location.city}, ${listing.location.state}` 
                    : listing.location}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Status</p>
                <p className="font-semibold">{listing.status}</p>
              </div>
            </div>

            {/* Imagens */}
            <div className="mb-4">
              <p className="text-xs text-slate-500 mb-2">Imagens ({listing.images?.length || 0})</p>
              {listing.images && listing.images.length > 0 ? (
                <div className="flex gap-2 overflow-x-auto">
                  {listing.images.map((img, idx) => (
                    <div key={idx} className="flex-shrink-0">
                      <img 
                        src={img} 
                        alt={`Imagem ${idx + 1}`}
                        className="w-32 h-32 object-cover rounded border"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/200x200?text=Erro';
                        }}
                      />
                      <p className="text-xs text-slate-400 mt-1 max-w-32 truncate">{img}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">Sem imagens</p>
              )}
            </div>

            {/* Details */}
            <div className="border-t pt-4">
              <p className="text-xs text-slate-500 mb-2">Detalhes (details)</p>
              <pre className="bg-slate-50 p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(listing.details, null, 2)}
              </pre>
            </div>

            {/* Contact */}
            <div className="border-t pt-4 mt-4">
              <p className="text-xs text-slate-500 mb-2">Contato (contact)</p>
              <pre className="bg-slate-50 p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(listing.contact, null, 2)}
              </pre>
            </div>

            {/* Objeto completo */}
            <details className="border-t pt-4 mt-4">
              <summary className="text-xs text-slate-500 mb-2 cursor-pointer hover:text-slate-700">
                🔍 Ver objeto completo (JSON)
              </summary>
              <pre className="bg-slate-900 text-green-400 p-3 rounded text-xs overflow-x-auto mt-2">
                {JSON.stringify(listing, null, 2)}
              </pre>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
