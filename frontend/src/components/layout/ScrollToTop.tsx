import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToTop } from '@/lib/scroll';

export const ScrollToTop: React.FC = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    scrollToTop(false);
  }, [pathname, search]);

  return null;
};
