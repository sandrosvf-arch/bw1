import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import BW1Platform from "./pages/bw1/BW1Platform.jsx";
import NotificationsPage from "./pages/bw1/NotificationsPage.jsx";
import ListingDetailPage from "./pages/bw1/ListingDetailPage.jsx";
import VehiclesPage from "./pages/bw1/VehiclesPage.jsx";
import PropertiesPage from "./pages/bw1/PropertiesPage.jsx";
import SearchPage from "./pages/bw1/SearchPage.jsx";
import MyListingsPage from "./pages/bw1/MyListingsPage.jsx";
import CreateListingPage from "./pages/bw1/CreateListingPage.jsx";
import MenuPage from "./pages/bw1/MenuPage.jsx";
import FavoritesPage from "./pages/bw1/FavoritesPage.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<BW1Platform />} />
        <Route path="/notificacoes" element={<NotificationsPage />} />
        <Route path="/anuncio/:id" element={<ListingDetailPage />} />
        <Route path="/veiculos" element={<VehiclesPage />} />
        <Route path="/imoveis" element={<PropertiesPage />} />
        <Route path="/buscar" element={<SearchPage />} />
        <Route path="/meus-anuncios" element={<MyListingsPage />} />
        <Route path="/criar-anuncio" element={<CreateListingPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/favoritos" element={<FavoritesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
