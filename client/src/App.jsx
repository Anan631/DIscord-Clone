import { useAuth } from './context/AuthContext';
import AuthPage from './components/AuthPage';
import ChatLayout from './components/ChatLayout';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  return user ? <ChatLayout /> : <AuthPage />;
}
