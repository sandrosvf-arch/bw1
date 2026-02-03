import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Search, Plus, MessageCircle, Menu } from "lucide-react";

/**
 * BottomNav (estilo OLX):
 * - Fixa embaixo
 * - “Floating pill”
 * - Item ativo com destaque
 *
 * Rotas padrão:
 * /            (Home)
 * /buscar      (Busca)
 * /anunciar    (Anunciar)
 * /chat        (Chat)
 * /menu        (Menu)
 *
 * Ajuste as rotas conforme seu app.
 */

function Item({ to, label, Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-2xl transition",
          isActive ? "text-white" : "text-slate-300 hover:text-white",
        ].join(" ")
      }
      title={label}
      aria-label={label}
    >
      <Icon size={22} />
      <span className="text-[11px] font-semibold leading-none">{label}</span>
    </NavLink>
  );
}

export default function BottomNav() {
  return (
    <div className="fixed left-0 right-0 bottom-0 z-[9998] pointer-events-none">
      {/* Safe area + padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-[calc(env(safe-area-inset-bottom,0px)+14px)]">
        <div className="pointer-events-auto">
          <div
            className="
              mx-auto
              w-full
              md:max-w-[520px]
              bg-slate-900/95
              supports-[backdrop-filter]:backdrop-blur-md backdrop-blur-md
              border border-white/10
              shadow-2xl
              rounded-[28px]
              px-2
              py-2
            "
          >
            <div className="grid grid-cols-5 items-center">
              <Item to="/" label="Início" Icon={Home} />
              <Item to="/buscar" label="Buscar" Icon={Search} />

              {/* Botão central destacado */}
              <NavLink
                to="/criar-anuncio"
                className={({ isActive }) =>
                  [
                    "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-2xl transition",
                    isActive ? "text-white bg-blue-600" : "text-white hover:bg-slate-800",
                  ].join(" ")
                }
                title="Anunciar"
                aria-label="Anunciar"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Plus size={20} />
                </div>
                <span className="text-[11px] font-semibold leading-none">Anunciar</span>
              </NavLink>

              <NavLink
                to="/meus-anuncios"
                className={({ isActive }) =>
                  [
                    "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-2xl transition",
                    isActive ? "text-white" : "text-slate-300 hover:text-white",
                  ].join(" ")
                }
                title="Conta"
                aria-label="Conta"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  U
                </div>
                <span className="text-[11px] font-semibold leading-none">Conta</span>
              </NavLink>

              <Item to="/menu" label="Menu" Icon={Menu} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
