import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Plus, MessageCircle, Menu, User } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import useActivityCounts from "../../../hooks/useActivityCounts";

function Item({ to, label, Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "flex flex-col items-center justify-center gap-0.5 py-2 flex-1 transition-colors",
          isActive ? "text-white" : "text-slate-400 hover:text-slate-300",
        ].join(" ")
      }
      title={label}
      aria-label={label}
    >
      {({ isActive }) => (
        <>
          <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
          <span className="text-[10px] font-semibold leading-none mt-0.5">{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function BottomNav() {
  const { user, isAuthenticated } = useAuth();
  const { unreadChats } = useActivityCounts(isAuthenticated);

  return (
    <div
      className="fixed left-0 right-0 bottom-0 z-50 bg-slate-900 border-t border-white/10 w-full"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-5 items-stretch h-14">
        {/* Início */}
        <Item to="/" label="Início" Icon={Home} />

        {/* Chat com contador */}
        <NavLink
          to="/chat"
          className={({ isActive }) =>
            [
              "relative flex flex-col items-center justify-center gap-0.5 py-2 flex-1 transition-colors",
              isActive ? "text-white" : "text-slate-400 hover:text-slate-300",
            ].join(" ")
          }
          title="Chat"
          aria-label="Chat"
        >
          {({ isActive }) => (
            <>
              <MessageCircle size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-semibold leading-none mt-0.5">Chat</span>
              {unreadChats > 0 && (
                <span className="absolute top-1.5 left-1/2 translate-x-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center pointer-events-none">
                  {unreadChats > 99 ? "99+" : unreadChats}
                </span>
              )}
            </>
          )}
        </NavLink>

        {/* Anunciar — botão central destacado */}
        <NavLink
          to="/criar-anuncio"
          className="flex flex-col items-center justify-center gap-0.5 py-2 flex-1 transition-colors text-slate-400 hover:text-slate-300"
          title="Anunciar"
          aria-label="Anunciar"
        >
          <div className="w-9 h-9 -mt-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
            <Plus size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-semibold leading-none text-slate-400 -mt-0.5">Anunciar</span>
        </NavLink>

        {/* Conta */}
        <NavLink
          to="/conta"
          className={({ isActive }) =>
            [
              "flex flex-col items-center justify-center gap-0.5 py-2 flex-1 transition-colors",
              isActive ? "text-white" : "text-slate-400 hover:text-slate-300",
            ].join(" ")
          }
          title="Conta"
          aria-label="Conta"
        >
          {({ isActive }) => (
            <>
              {isAuthenticated && user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className={`w-6 h-6 rounded-full object-cover border-2 ${isActive ? 'border-white' : 'border-slate-500'}`}
                />
              ) : isAuthenticated ? (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              ) : (
                <User size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              )}
              <span className="text-[10px] font-semibold leading-none mt-0.5">Conta</span>
            </>
          )}
        </NavLink>

        {/* Menu */}
        <Item to="/menu" label="Menu" Icon={Menu} />
      </div>
    </div>
  );
}
