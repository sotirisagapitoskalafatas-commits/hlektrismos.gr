import { useEffect, useState } from 'react';

export type Route = 'landing' | 'login' | 'app' | 'privacy' | 'terms';

const ROUTES: Record<string, Route> = {
  '/login': 'login',
  '/app': 'app',
  '/privacy': 'privacy',
  '/terms': 'terms',
};

function parse(): Route {
  return ROUTES[window.location.hash.slice(1)] ?? 'landing';
}

export function useRoute(): [Route, (r: Route) => void] {
  const [route, setRoute] = useState<Route>(parse);

  useEffect(() => {
    const handler = () => {
      setRoute(parse());
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
