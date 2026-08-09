import { AuthProvider, useAuth } from '@/lib/auth';
import { useRoute } from '@/lib/router';
import LandingPage from '@/components/LandingPage';
import LoginPage from '@/components/LoginPage';
import DashboardPage from '@/components/DashboardPage';

function AppContent() {
  const [route, navigate] = useRoute();
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Protect dashboard route — redirect to login if not signed in.
  if (route === 'dashboard' && !session) {
    navigate('login');
    return null;
  }

  // If already signed in and on login page, go to dashboard.
  if (route === 'login' && session) {
    navigate('dashboard');
    return null;
  }

  if (route === 'login') return <LoginPage />;
  if (route === 'dashboard') return <DashboardPage />;
  return <LandingPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
