import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import BW1Platform from "./pages/bw1/BW1Platform.jsx";
import NotificationsPage from "./pages/bw1/NotificationsPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<BW1Platform />} />
      <Route path="/notificacoes" element={<NotificationsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
