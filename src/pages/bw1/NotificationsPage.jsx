import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import NOTIFICATIONS from "./content/notifications.js";

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
  const [items, setItems] = useState(() => NOTIFICATIONS);
  const [tab, setTab] = useState("all"); // all | unread

  const unreadCount = useMemo(() => items.filter((n) => n.unread).length, [items]);

  const filteredItems = useMemo(() => {
    if (tab === "unread") return items.filter((n) => n.unread);
    return items;
  }, [items, tab]);

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, unread: false })));

  const markOneRead = (id) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-slate-900/92 supports-[backdrop-filter]:backdrop-blur-md backdrop-blur-md border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition"
              title="Voltar"
              aria-label="Voltar"
            >
              <ArrowLeft size={20} />
            </Link>

            <div>
              <div className="text-white font-extrabold text-base">Notificações</div>
              <div className="text-slate-300 text-[12px]">
                {unreadCount > 0 ? `${unreadCount} não lidas` : "Tudo em dia"}
              </div>
            </div>
          </div>

          <button
            onClick={markAllRead}
            className="text-[12px] px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 transition text-white flex items-center gap-2"
            title="Marcar todas como lidas"
          >
            <Check size={16} />
            Marcar lidas
          </button>
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

        {/* List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-sm font-bold text-slate-900">Sem notificações aqui</div>
              <div className="text-slate-500 text-sm mt-1">
                Quando algo acontecer, vai aparecer por aqui.
              </div>
            </div>
          ) : (
            filteredItems.map((n) => (
              <button
                key={n.id}
                onClick={() => markOneRead(n.id)}
                className="w-full text-left px-5 py-4 hover:bg-slate-50 transition border-b border-slate-100"
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
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
