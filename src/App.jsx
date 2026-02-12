import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import keepAliveService from "./services/keepAlive.js";

import BW1Platform from "./pages/bw1/BW1Platform.jsx";
import NotificationsPage from "./pages/bw1/NotificationsPage.jsx";
import ListingDetailPage from "./pages/bw1/ListingDetailPage.jsx";
import VehiclesPage from "./pages/bw1/VehiclesPage.jsx";
import PropertiesPage from "./pages/bw1/PropertiesPage.jsx";
import SearchPage from "./pages/bw1/SearchPage.jsx";
import MyListingsPage from "./pages/bw1/MyListingsPage.jsx";
import CreateListingPage from "./pages/bw1/CreateListingPage.jsx";
import MenuPage from "./pages/bw1/MenuPage.jsx";
import AccountPage from "./pages/bw1/AccountPage.jsx";
import FavoritesPage from "./pages/bw1/FavoritesPage.jsx";
import ChatPage from "./pages/bw1/ChatPage.jsx";
import ChatConversationPage from "./pages/bw1/ChatConversationPage.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import OAuthCallbackPage from "./pages/auth/OAuthCallbackPage.jsx";
import DebugListingsPage from "./pages/bw1/DebugListingsPage.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

export default function App() {
  // Iniciar serviço de keep-alive para manter o backend ativo
  useEffect(() => {
    keepAliveService.start();
    
    return () => {
      keepAliveService.stop();
    };
  }, []);

  return (
    <AuthProvider>
      <ScrollToTop />
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
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
