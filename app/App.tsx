import "./global.css"
import { AuthProvider, useAuth } from "./src/providers/AuthProvider";
import { AuthPage } from "./src/pages/AuthPage";
import { AuthenticatedPage } from "./src/pages/AuthenticatedPage";
import { LoadingPage } from "./src/pages/LoadingPage";

const AppContent = () => {
  const { session, isReady, logout } = useAuth();

  if (!isReady) {
    return <LoadingPage />;
  }

  if (session) {
    return <AuthenticatedPage session={session} onLogout={logout} />;
  }

  return <AuthPage />;
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
