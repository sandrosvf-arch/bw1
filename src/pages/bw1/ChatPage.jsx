import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MessageSquare, Search, ArrowLeft, Clock } from "lucide-react";

import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import AppShell from "./components/AppShell";
import Footer from "./components/Footer";

import * as BrandMod from "./content/brand.js";
import * as NavMod from "./content/navigation.js";
import * as FooterMod from "./content/footer.js";

const BRAND = BrandMod.default ?? BrandMod.BRAND;
const NAVIGATION = NavMod.default ?? NavMod.NAVIGATION;
const FOOTER = FooterMod.default ?? FooterMod.FOOTER;

export default function ChatPage() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Carrega conversas do localStorage
    const stored = localStorage.getItem("bw1_conversations");
    if (stored) {
      const data = JSON.parse(stored);
      setConversations(data);
    }
  }, []);

  const filteredConversations = conversations.filter((conv) => {
    const s = searchTerm.toLowerCase();
    return (
      conv.title.toLowerCase().includes(s) ||
      conv.lastMessage.toLowerCase().includes(s)
    );
  });

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Agora";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

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
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 lg:pb-8">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
            >
              <ArrowLeft size={20} />
              Voltar
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <MessageSquare size={28} className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Mensagens</h1>
                <p className="text-slate-600">
                  {conversations.length} conversa(s)
                </p>
              </div>
            </div>
          </div>

          {/* Barra de busca */}
          <div className="mb-6">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Buscar conversas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Lista de conversas */}
          {filteredConversations.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
              <MessageSquare size={64} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Nenhuma conversa ainda
              </h3>
              <p className="text-slate-600 mb-6">
                Quando você entrar em contato com anunciantes, as conversas
                aparecerão aqui.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                Ver Anúncios
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {filteredConversations.map((conv) => (
                <Link
                  key={conv.id}
                  to={`/chat/${conv.id}`}
                  className="flex items-center gap-4 p-4 border-b border-slate-100 hover:bg-slate-50 transition"
                >
                  {/* Imagem do anúncio */}
                  <img
                    src={conv.listingImage}
                    alt={conv.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-slate-900 truncate">
                        {conv.title}
                      </h3>
                      <span className="text-xs text-slate-500 ml-2">
                        {getTimeAgo(conv.lastMessageTime)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 truncate">
                      {conv.lastMessage}
                    </p>
                  </div>

                  {/* Badge de mensagens não lidas */}
                  {conv.unreadCount > 0 && (
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {conv.unreadCount}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </main>

        <BottomNav />
      </AppShell>
    </div>
  );
}
