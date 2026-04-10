import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { RegisterPage } from './pages/RegisterPage';
import { MaquinasPage } from './pages/MaquinasPage';
import { ClasesPage } from './pages/ClasesPage';
import { PerfilPage } from './pages/PerfilPage';


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
        <main className="grow flex flex-col">
          <Routes>
            {/* Ruta Pública (Login) */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />

            {/* Rutas Privadas (Solo entras si pasas el ProtectedRoute) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route path="/perfil"
              element={
                <PerfilPage />}
            />

            {/* 2. AÑADIMOS LA RUTA PROTEGIDA DE LAS MÁQUINAS */}
            <Route
              path="/maquinas"
              element={
                <ProtectedRoute>
                  <MaquinasPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/clases"
              element={
                <ProtectedRoute>
                  <ClasesPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />

      </div>
    </BrowserRouter>
  );
};

export default App;