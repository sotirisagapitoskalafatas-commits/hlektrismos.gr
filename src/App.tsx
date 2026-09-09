import { AuthProvider, useAuth } from '@/lib/auth';
import { useRoute } from '@/lib/router';
import { NavProvider } from '@/lib/nav';
import LandingPage from '@/components/LandingPage';
import LoginPage from '@/components/LoginPage';
import AppShell from '@/components/app/AppShell';

function AppContent() {
  const [route, navigate] = useRoute();
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-line border-t-ink rounded-full animate-spin" />
      </div>
    );
  }

  // Protect the app — redirect to login if not signed in.
  if (route === 'app' && !session) {
    navigate('login');
    return null;
  }

  // If already signed in and on login page, go to the app.
  if (route === 'login' && session) {
    navigate('app');
    return null;
  }

  if (route === 'login') return <LoginPage />;
  if (route === 'app') return <AppShell />;
  return <LandingPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <NavProvider>
        <AppContent />
      </NavProvider>
    </AuthProvider>
  );
}