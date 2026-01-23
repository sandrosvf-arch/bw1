import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, Bell, Check } from "lucide-react";
import NOTIFICATIONS from "../content/notifications";

/**
 * Logo em:
 * /public/logo-bw1.png
 */

const COLORS = {
  carros: "#ffffff",
  imoveis: "#ff6a00",
  e: "#ffffff",
  logoBg: "#ffffff",     // branco total
  logoBorder: "#e5e7eb", // cinza claro
};

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

export default function Navbar({
  brand,
  links,
  cta,
  // compat: se seu BW1Platform ainda manda esses, pode continuar
  isMenuOpen,
  onToggleMenu,
}) {
  const [logoOk, setLogoOk] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  // --- Notificações (mock) ---
  const [items, setItems] = useState(() => NOTIFICATIONS);
  const [tab, setTab] = useState("all"); // all | unread

  // --- controle do painel (compat com estado externo ou interno) ---
  const [internalOpen, setInternalOpen] = useState(false);
  const notifOpen = typeof isMenuOpen === "boolean" ? isMenuOpen : internalOpen;

  const setOpen = (v) => {
    if (typeof isMenuOpen === "boolean" && typeof onToggleMenu === "function") {
      // modo controlado (abre/fecha via toggle)
      if (v !== notifOpen) onToggleMenu();
    } else {
      setInternalOpen(v);
    }
  };

  const toggleOpen = () => setOpen(!notifOpen);

  const unreadCount = useMemo(
    () => items.filter((n) => n.unread).length,
    [items]
  );

  const filteredItems = useMemo(() => {
    if (tab === "unread") return items.filter((n) => n.unread);
    return items;
  }, [items, tab]);

  const panelRef = useRef(null);

  // --- Scroll blur/transparência (como tava) ---
  useEffect(() => {
    const ON_Y = 14;
    const OFF_Y = 4;

    const onScroll = () => {
      const y = window.scrollY || 0;
      setScrolled((prev) => {
        if (!prev && y > ON_Y) return true;
        if (prev && y < OFF_Y) return false;
        return prev;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // --- Fechar clicando fora + ESC ---
  useEffect(() => {
    if (!notifOpen) return;

    const onDown = (e) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target)) setOpen(false);
    };

    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [notifOpen]);

  const navClass = scrolled
    ? "bg-slate-900/92 supports-[backdrop-filter]:backdrop-blur-md backdrop-blur-md"
    : "bg-slate-900";

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const markOneRead = (id) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const Badge = () =>
    unreadCount > 0 ? (
      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-slate-900">
        {unreadCount > 99 ? "99+" : unreadCount}
      </span>
    ) : null;

  return (
    <nav
      className={`${navClass} relative text-white sticky top-0 z-50 border-0 shadow-none transition-all duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Logo + Categories */}
          <div className="flex items-center gap-3">
            <div
              className="rounded-xl px-3 py-2 flex items-center"
              style={{
                backgroundColor: COLORS.logoBg,
                border: `1px solid ${COLORS.logoBorder}`,
              }}
            >
              {logoOk ? (
                <img
                  src="/logo-bw1.png"
                  alt={brand?.name || "BW1"}
                  className="h-10 w-auto"
                  onError={() => setLogoOk(false)}
                />
              ) : (
                <span className="text-xl font-bold tracking-tighter text-slate-900">
                  {brand?.name || "BW1"}
                </span>
              )}
            </div>

            <span className="text-base sm:text-lg border-l border-slate-700/80 pl-3">
              <span
                className="font-extrabold tracking-wide"
                style={{ color: COLORS.carros }}
              >
                CARROS
              </span>

              <span className="mx-2 font-extrabold" style={{ color: COLORS.e }}>
                &amp;
              </span>

              <span
                className="font-extrabold tracking-wide"
                style={{ color: COLORS.imoveis }}
              >
                IMÓVEIS
              </span>
            </span>
          </div>

          {/* Right: Desktop links + CTA + Bell */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-baseline space-x-2">
              {links?.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </div>

            {/* Bell (desktop) */}
            <button
              onClick={toggleOpen}
              className="relative p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 focus:outline-none transition"
              title="Notificações"
              aria-label="Notificações"
            >
              {notifOpen ? <X size={22} /> : <Bell size={22} />}
              {!notifOpen && <Badge />}
            </button>

            <a
              href={cta?.href || "#"}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium transition-all shadow-lg shadow-blue-900/50"
            >
              {cta?.label || "Entrar"}
            </a>
          </div>

          {/* Mobile: Bell */}
          <div className="md:hidden">
            <button
              onClick={toggleOpen}
              className="relative p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 focus:outline-none transition"
              title="Notificações"
              aria-label="Notificações"
            >
              {notifOpen ? <X size={24} /> : <Bell size={24} />}
              {!notifOpen && <Badge />}
            </button>
          </div>
        </div>
      </div>

      {/* ===== Painel Notificações (Desktop) ===== */}
      {notifOpen && (
        <>
          {/* Desktop popover */}
          <div className="hidden md:block absolute right-4 top-full mt-2 z-[60]">
            <div
              ref={panelRef}
              className="w-[380px] bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm">Notificações</div>
                  <div className="text-[11px] text-slate-300">
                    {unreadCount > 0 ? `${unreadCount} não lidas` : "Tudo em dia"}
                  </div>
                </div>

                <button
                  onClick={markAllRead}
                  className="text-[11px] px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 transition flex items-center gap-1"
                  title="Marcar todas como lidas"
                >
                  <Check size={14} />
                  Marcar lidas
                </button>
              </div>

              {/* Tabs */}
              <div className="p-2 bg-slate-50 border-b border-slate-100">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTab("all")}
                    className={`py-2 rounded-xl text-sm font-semibold transition ${
                      tab === "all"
                        ? "bg-white shadow-sm border border-slate-200 text-slate-900"
                        : "hover:bg-white text-slate-700"
                    }`}
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => setTab("unread")}
                    className={`py-2 rounded-xl text-sm font-semibold transition ${
                      tab === "unread"
                        ? "bg-white shadow-sm border border-slate-200 text-slate-900"
                        : "hover:bg-white text-slate-700"
                    }`}
                  >
                    Não lidas
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="max-h-[420px] overflow-y-auto">
                {filteredItems.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="text-sm font-bold text-slate-900">
                      Sem notificações aqui
                    </div>
                    <div className="text-slate-500 text-sm mt-1">
                      Quando algo acontecer, vai aparecer por aqui.
                    </div>
                  </div>
                ) : (
                  filteredItems.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markOneRead(n.id)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 transition border-b border-slate-100"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-1.5 h-2.5 w-2.5 rounded-full ${
                            n.unread ? "bg-red-500" : "bg-slate-300"
                          }`}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div
                              className={`text-sm font-bold ${
                                n.unread ? "text-slate-900" : "text-slate-700"
                              }`}
                            >
                              {n.title}
                            </div>
                            <div className="text-[11px] text-slate-500 whitespace-nowrap">
                              {formatWhen(n.date)}
                            </div>
                          </div>
                          <div className="text-sm text-slate-600 mt-0.5">
                            {n.text}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-white border-t border-slate-100">
                <button
                  onClick={() => setOpen(false)}
                  className="w-full py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>

          {/* ===== Painel Notificações (Mobile) ===== */}
          <div className="md:hidden fixed inset-0 z-[70]">
            {/* overlay */}
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setOpen(false)}
            />

            {/* sheet */}
            <div
              ref={panelRef}
              className="absolute bottom-0 left-0 right-0 h-[80vh]
                         bg-white text-slate-800
                         rounded-t-3xl shadow-2xl border-t border-slate-200
                         overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm">Notificações</div>
                  <div className="text-[11px] text-slate-300">
                    {unreadCount > 0 ? `${unreadCount} não lidas` : "Tudo em dia"}
                  </div>
                </div>

                <button
                  onClick={markAllRead}
                  className="text-[11px] px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 transition flex items-center gap-1"
                  title="Marcar todas como lidas"
                >
                  <Check size={14} />
                  Marcar lidas
                </button>
              </div>

              {/* Tabs */}
              <div className="p-2 bg-slate-50 border-b border-slate-100">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTab("all")}
                    className={`py-2 rounded-xl text-sm font-semibold transition ${
                      tab === "all"
                        ? "bg-white shadow-sm border border-slate-200 text-slate-900"
                        : "hover:bg-white text-slate-700"
                    }`}
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => setTab("unread")}
                    className={`py-2 rounded-xl text-sm font-semibold transition ${
                      tab === "unread"
                        ? "bg-white shadow-sm border border-slate-200 text-slate-900"
                        : "hover:bg-white text-slate-700"
                    }`}
                  >
                    Não lidas
                  </button>
                </div>
              </div>

              {/* List (não corta mais) */}
              <div className="flex-1 overflow-y-auto">
                {filteredItems.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="text-sm font-bold text-slate-900">
                      Sem notificações aqui
                    </div>
                    <div className="text-slate-500 text-sm mt-1">
                      Quando algo acontecer, vai aparecer por aqui.
                    </div>
                  </div>
                ) : (
                  filteredItems.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markOneRead(n.id)}
                      className="w-full text-left px-4 py-3 active:bg-slate-50 transition border-b border-slate-100"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-1.5 h-2.5 w-2.5 rounded-full ${
                            n.unread ? "bg-red-500" : "bg-slate-300"
                          }`}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div
                              className={`text-sm font-bold ${
                                n.unread ? "text-slate-900" : "text-slate-700"
                              }`}
                            >
                              {n.title}
                            </div>
                            <div className="text-[11px] text-slate-500 whitespace-nowrap">
                              {formatWhen(n.date)}
                            </div>
                          </div>
                          <div className="text-sm text-slate-600 mt-0.5">
                            {n.text}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-white border-t border-slate-100">
                <button
                  onClick={() => setOpen(false)}
                  className="w-full py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
