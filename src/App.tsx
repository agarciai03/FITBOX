import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Componentes de Estructura (Layout)
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

// Páginas
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { RegistroPage } from './pages/RegisterPage';


// Componente Guardián (Protege las rutas privadas)
// Si el usuario no está logueado, el router lo expulsa a la pantalla inicial "/"
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((state) => state.user);
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export const App = () => {
  const { checkSession, isLoading } = useAuthStore();

  // Al abrir la web, le preguntamos a Supabase si ya teníamos una sesión guardada
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Mientras Supabase responde (tarda milisegundos), mostramos una pantalla de carga oscura
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-fitbox-bg">
        <h1 className="text-3xl font-bold text-white mb-4 animate-pulse">
          FIT<span className="text-fitbox-red">BOX</span>
        </h1>
        <p className="text-fitbox-text-muted">Conectando con el servidor...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* Contenedor principal: flex-col y min-h-screen para que el Footer se quede siempre abajo */}
      <div className="min-h-screen flex flex-col bg-fitbox-bg font-sans">

        <Header />

        {/* main actua como contenedor expansible donde se cargan las páginas */}
        <main className="flex-grow flex flex-col">
          <Routes>
            {/* Ruta Pública (Login) */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/registro" element={<RegistroPage />} />

            {/* Rutas Privadas (Solo entras si pasas el ProtectedRoute) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Ruta comodín: Si el usuario inventa una URL (/pepito), lo mandamos al inicio */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />

      </div>
    </BrowserRouter>
  );
};

export default App;