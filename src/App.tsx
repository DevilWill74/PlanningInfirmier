import React, { useEffect } from 'react';
import { NurseScheduler } from './components/NurseScheduler';
import { Login } from './components/Login';
import { useAuthStore } from './stores/authStore';
import { AlertCircle, Loader } from 'lucide-react';
import { useRealtimeSync } from './hooks/useRealtimeSync';
import { useSupabaseHealth } from './hooks/useSupabaseHealth';

function App() {
  const { user, loading, error, initialize } = useAuthStore();
  const { isHealthy, isChecking, error: healthError } = useSupabaseHealth();

  useRealtimeSync();

  useEffect(() => {
    if (isHealthy) {
      initialize().catch(console.error);
    }
  }, [initialize, isHealthy]);

  if (isChecking || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center">
          <Loader className="animate-spin h-12 w-12 text-blue-600 mb-4" />
          <p className="text-gray-600">Initialisation...</p>
        </div>
      </div>
    );
  }

  if (!isHealthy || healthError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <AlertCircle className="mx-auto text-red-500 h-12 w-12 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Erreur de connexion</h2>
          <p className="text-gray-600 mb-4">
            {healthError || "Impossible de se connecter à la base de données"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <AlertCircle className="mx-auto text-red-500 h-12 w-12 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NurseScheduler 
        isAdmin={user.role === 'admin'}
        currentUser={user}
      />
    </div>
  );
}

export default App;