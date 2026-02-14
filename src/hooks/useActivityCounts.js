import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

const READ_NOTIFICATIONS_KEY = "bw1-notifications-read";

function getReadMap() {
  try {
    return JSON.parse(localStorage.getItem(READ_NOTIFICATIONS_KEY) || "{}");
  } catch {
    return {};
  }
}

export default function useActivityCounts(isAuthenticated) {
  const [counts, setCounts] = useState({
    unreadNotifications: 0,
    unreadChats: 0,
  });

  const loadCounts = useCallback(async () => {
    if (!isAuthenticated) {
      setCounts({ unreadNotifications: 0, unreadChats: 0 });
      return;
    }

    try {
      const readMap = getReadMap();

      const [conversationsRes, myListingsRes] = await Promise.allSettled([
        api.getConversations(),
        api.getMyListings(),
      ]);

      let unreadNotifications = 0;
      let unreadChats = 0;

      if (conversationsRes.status === "fulfilled") {
        (conversationsRes.value?.conversations || []).forEach((conversation) => {
          const key = `chat-${conversation.id}`;
          const unread = !readMap[key];
          if (unread) {
            unreadNotifications += 1;
            unreadChats += 1;
          }
        });
      }

      if (myListingsRes.status === "fulfilled") {
        (myListingsRes.value?.listings || []).forEach((listing) => {
          const key = `listing-${listing.id}`;
          const unread = !readMap[key];
          if (unread) unreadNotifications += 1;
        });
      }

      setCounts({ unreadNotifications, unreadChats });
    } catch (error) {
      console.error("Erro ao carregar contadores de atividade:", error);
      setCounts({ unreadNotifications: 0, unreadChats: 0 });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadCounts();

    const onFocus = () => loadCounts();
    const onStorage = () => loadCounts();
    const onActivityUpdated = () => loadCounts();
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    window.addEventListener("bw1-activity-updated", onActivityUpdated);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("bw1-activity-updated", onActivityUpdated);
    };
  }, [loadCounts]);

  return {
    ...counts,
    refreshActivityCounts: loadCounts,
  };
}
