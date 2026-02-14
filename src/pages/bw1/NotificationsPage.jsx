import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import * as BrandMod from "./content/brand.js";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

const BRAND = BrandMod.default ?? BrandMod.BRAND;
const READ_NOTIFICATIONS_KEY = "bw1-notifications-read";

function formatWhen(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const now = new Date();

  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();

  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");

  if (sameDay) return `Hoje • ${hh}:${mm}`;
  if (isYesterday) return `Ontem • ${hh}:${mm}`;

  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )} • ${hh}:${mm}`;
}

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("all"); // all | unread
  const [loading, setLoading] = useState(true);
  const [logoOk, setLogoOk] = React.useState(true);

  useEffect(() => {
    loadNotifications();
  }, [isAuthenticated]);

  const getReadMap = () => {
    try {
      return JSON.parse(localStorage.getItem(READ_NOTIFICATIONS_KEY) || "{}");
    } catch {
      return {};
    }
  };

  const saveReadMap = (map) => {
    localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(map));
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const readMap = getReadMap();
      const notifications = [];

      if (isAuthenticated) {
        const [conversationsRes, myListingsRes] = await Promise.allSettled([
          api.getConversations(),
          api.getMyListings(),
        ]);

        if (conversationsRes.status === "fulfilled") {
          (conversationsRes.value?.conversations || []).forEach((conversation) => {
            const key = `chat-${conversation.id}`;
            notifications.push({
              id: key,
              title: "Nova atividade no chat",
              text: `Conversa sobre \"${conversation?.listings?.title || "anúncio"}\" teve atualização.`,
              date: conversation.updated_at || new Date().toISOString(),
              unread: !readMap[key],
              link: `/chat/${conversation.id}`,
            });
          });
        }

        if (myListingsRes.status === "fulfilled") {
          (myListingsRes.value?.listings || []).forEach((listing) => {
            const key = `listing-${listing.id}`;
            notifications.push({
              id: key,
              title: "Anúncio ativo",
              text: `Seu anúncio \"${listing.title}\" está publicado e recebendo visualizações.`,
              date: listing.created_at || new Date().toISOString(),
              unread: !readMap[key],
              link: `/anuncio/${listing.id}`,
            });
          });
        }
      }

      notifications.sort((a, b) => new Date(b.date) - new Date(a.date));
      setItems(notifications);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = useMemo(() => items.filter((n) => n.unread).length, [items]);

  const filteredItems = useMemo(() => {
    if (tab === "unread") return items.filter((n) => n.unread);
    return items;
  }, [items, tab]);

  const markAllRead = () => {
    setItems((prev) => {
      const next = prev.map((n) => ({ ...n, unread: false }));
      const readMap = getReadMap();
      next.forEach((item) => {
        readMap[item.id] = true;
      });
      saveReadMap(readMap);
      return next;
    });
  };

  const markOneRead = (id) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
    const readMap = getReadMap();
    readMap[id] = true;
    saveReadMap(readMap);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-slate-900/92 supports-[backdrop-filter]:backdrop-blur-md backdrop-blur-md border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition"
              title="Voltar"
              aria-label="Voltar"
            >
              <ArrowLeft size={20} />
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

            <div className="border-l border-slate-700/80 pl-3">
              <div className="text-white font-extrabold text-base">Notificações</div>
              <div className="text-slate-300 text-[12px]">
                {unreadCount > 0 ? `${unreadCount} não lidas` : "Tudo em dia"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 mb-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setTab("all")}
              className={`py-2 rounded-xl text-sm font-semibold transition ${
                tab === "all" ? "bg-slate-900 text-white" : "hover:bg-slate-50 text-slate-700"
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setTab("unread")}
              className={`py-2 rounded-xl text-sm font-semibold transition ${
                tab === "unread" ? "bg-slate-900 text-white" : "hover:bg-slate-50 text-slate-700"
              }`}
            >
              Não lidas
            </button>
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <button
            onClick={markAllRead}
            className="text-[12px] px-3 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition flex items-center gap-2"
            title="Marcar todas como lidas"
          >
            <Check size={16} />
            Marcar todas como lidas
          </button>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-sm font-bold text-slate-900">Carregando notificações...</div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-sm font-bold text-slate-900">Sem notificações aqui</div>
              <div className="text-slate-500 text-sm mt-1">
                Quando algo acontecer, vai aparecer por aqui.
              </div>
            </div>
          ) : (
            filteredItems.map((n) => (
              <Link
                key={n.id}
                to={n.link || "/"}
                onClick={() => markOneRead(n.id)}
                className="block w-full text-left px-5 py-4 hover:bg-slate-50 transition border-b border-slate-100"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1.5 h-2.5 w-2.5 rounded-full ${
                      n.unread ? "bg-red-500" : "bg-slate-300"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className={`text-sm font-extrabold ${n.unread ? "text-slate-900" : "text-slate-700"}`}>
                        {n.title}
                      </div>
                      <div className="text-[11px] text-slate-500 whitespace-nowrap">
                        {formatWhen(n.date)}
                      </div>
                    </div>
                    <div className="text-sm text-slate-600 mt-0.5">{n.text}</div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
