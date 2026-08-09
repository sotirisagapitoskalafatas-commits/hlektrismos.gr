import { useEffect, useState } from 'react';

export type Route = 'landing' | 'login' | 'dashboard';

export function useRoute(): [Route, (r: Route) => void] {
  const [route, setRoute] = useState<Route>(() => {
    const hash = window.location.hash.slice(1);
    if (hash === '/login') return 'login';
    if (hash === '/dashboard') return 'dashboard';
    return 'landing';
  });

  useEffect(() => {
    const handler = () => {
      const hash = window.location.hash.slice(1);
      if (hash === '/login') setRoute('login');
      else if (hash === '/dashboard') setRoute('dashboard');
      else setRoute('landing');
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const navigate = (r: Route) => {
    window.location.hash = r === 'landing' ? '/' : `/${r}`;
  };

  return [route, navigate];
}
