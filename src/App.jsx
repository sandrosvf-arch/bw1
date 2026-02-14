import React, { useEffect, Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import keepAliveService from "./services/keepAlive.js";
import api from "./services/api.js";
import ScrollToTop from "./components/ScrollToTop.jsx";

// Páginas críticas - carregamento imediato
import BW1Platform from "./pages/bw1/BW1Platform.jsx";
import ListingDetailPage from "./pages/bw1/ListingDetailPage.jsx";
import VehiclesPage from "./pages/bw1/VehiclesPage.jsx";
import PropertiesPage from "./pages/bw1/PropertiesPage.jsx";

// Páginas secundárias - lazy loading
const NotificationsPage = lazy(() => import("./pages/bw1/NotificationsPage.jsx"));
const SearchPage = lazy(() => import("./pages/bw1/SearchPage.jsx"));
const MyListingsPage = lazy(() => import("./pages/bw1/MyListingsPage.jsx"));
const CreateListingPage = lazy(() => import("./pages/bw1/CreateListingPage.jsx"));
const ListingSuccessPage = lazy(() => import("./pages/bw1/ListingSuccessPage.jsx"));
const MenuPage = lazy(() => import("./pages/bw1/MenuPage.jsx"));
const AccountPage = lazy(() => import("./pages/bw1/AccountPage.jsx"));
const FavoritesPage = lazy(() => import("./pages/bw1/FavoritesPage.jsx"));
const ChatPage = lazy(() => import("./pages/bw1/ChatPage.jsx"));
const ChatConversationPage = lazy(() => import("./pages/bw1/ChatConversationPage.jsx"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage.jsx"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage.jsx"));
const OAuthCallbackPage = lazy(() => import("./pages/auth/OAuthCallbackPage.jsx"));
const DebugListingsPage = lazy(() => import("./pages/bw1/DebugListingsPage.jsx"));

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
      <p className="mt-2 text-sm text-slate-600">Carregando...</p>
    </div>
  </div>
);

export default function App() {
  // Iniciar serviço de keep-alive para manter o backend ativo
  useEffect(() => {
    keepAliveService.start();

    const preload = () => {
      api.preloadListings().catch(() => {
        // noop
      });
    };

    preload();
    
    return () => {
      keepAliveService.stop();
    };
  }, []);

  return (
    <AuthProvider>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<BW1Platform />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<OAuthCallbackPage />} />
          <Route path="/anuncio/:id" element={<ListingDetailPage />} />
          <Route path="/veiculos" element={<VehiclesPage />} />
          <Route path="/imoveis" element={<PropertiesPage />} />
          <Route path="/buscar" element={<SearchPage />} />
          <Route path="/debug" element={<DebugListingsPage />} />
          
          {/* Rotas protegidas - requerem login */}
          <Route path="/notificacoes" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/meus-anuncios" element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
          <Route path="/criar-anuncio" element={<ProtectedRoute><CreateListingPage /></ProtectedRoute>} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/conta" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
          <Route path="/favoritos" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/chat/:conversationId" element={<ProtectedRoute><ChatConversationPage /></ProtectedRoute>} />
          
          <Route path="/anuncio-publicado" element={<ProtectedRoute><ListingSuccessPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
