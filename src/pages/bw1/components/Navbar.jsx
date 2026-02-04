import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bell, LogIn, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import NOTIFICATIONS from "../content/notifications";

const COLORS = {
  carros: "#ffffff",
  imoveis: "#ff6a00",
  e: "#ffffff",
  logoBg: "#ffffff",
  logoBorder: "#e5e7eb",
};

export default function Navbar({ brand, links, cta }) {
  const [logoOk, setLogoOk] = useState(true);
  const { user, isAuthenticated } = useAuth();

  // show/hide on scroll
  const [hidden, setHidden] = useState(false);
  const lastYRef = useRef(0);
  const tickingRef = useRef(false);

  const unreadCount = useMemo(() => {
    if (!Array.isArray(NOTIFICATIONS)) return 0;
    return NOTIFICATIONS.filter((n) => n.unread).length;
  }, []);

  const Badge = () =>
    unreadCount > 0 ? (
      <span
        style={{ top: -6, right: -6 }}
        className="absolute min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-slate-900 pointer-events-none"
      >
        {unreadCount > 99 ? "99+" : unreadCount}
      </span>
    ) : null;

  useEffect(() => {
    lastYRef.current = window.scrollY || 0;

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        const lastY = lastYRef.current;

        const goingDown = y > lastY;
        const goingUp = y < lastY;

        // ajuste fino
        const SHOW_AT_TOP_Y = 10;     // perto do topo sempre mostra
        const HIDE_AFTER_Y = 80;      // só começa a esconder depois de rolar um pouco
        const DELTA = 6;             // evita “tremidinha” por micro-scroll

        if (y <= SHOW_AT_TOP_Y) {
          setHidden(false);
        } else if (y > HIDE_AFTER_Y) {
          if (goingDown && y - lastY > DELTA) setHidden(true);
          if (goingUp && lastY - y > DELTA) setHidden(false);
        }

        lastYRef.current = y;
        tickingRef.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={[
        "fixed top-0 left-0 right-0 z-[9999] bg-slate-900 text-white border-b border-white/10",
        "transition-transform duration-200 ease-out",
        hidden ? "-translate-y-full" : "translate-y-0",
      ].join(" ")}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left */}
          <div className="flex items-center gap-3">
            <Link to="/">
              <div
                className="rounded-xl px-3 py-2 flex items-center cursor-pointer hover:opacity-80 transition"
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
            </Link>

            <span className="text-base sm:text-lg border-l border-slate-700/80 pl-3">
              <span className="font-extrabold tracking-wide" style={{ color: COLORS.carros }}>
                CARROS
              </span>
              <span className="mx-2 font-extrabold" style={{ color: COLORS.e }}>
                &amp;
              </span>
              <span className="font-extrabold tracking-wide" style={{ color: COLORS.imoveis }}>
                IMÓVEIS
              </span>
            </span>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/notificacoes"
              className="relative w-10 h-10 flex items-center justify-center rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition"
              title="Notificações"
              aria-label="Notificações"
            >
              <Bell size={22} className="block" />
              <Badge />
            </Link>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              to="/notificacoes"
              className="relative w-10 h-10 flex items-center justify-center rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition"
              title="Notificações"
              aria-label="Notificações"
            >
              <Bell size={24} className="block" />
              <Badge />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
