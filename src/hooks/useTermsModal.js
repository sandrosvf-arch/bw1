import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const TERMS_ACCEPTED_KEY = 'bw1_terms_accepted';

export function useTermsModal() {
  const { user } = useAuth();
  const [showTermsModal, setShowTermsModal] = useState(false);

  useEffect(() => {
    if (user) {
      const hasAccepted = localStorage.getItem(TERMS_ACCEPTED_KEY);
      if (!hasAccepted) {
        setShowTermsModal(true);
      }
    }
  }, [user]);

  const handleAcceptTerms = () => {
    localStorage.setItem(TERMS_ACCEPTED_KEY, 'true');
    setShowTermsModal(false);
  };

  return {
    showTermsModal,
    handleAcceptTerms,
  };
}
