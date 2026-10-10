import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scrolls to top on route change (unless a hash target exists). */
const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
