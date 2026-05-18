import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { RegisterPage } from './pages/RegisterPage';
import { MaquinasPage } from './pages/MaquinasPage';
import { ClasesPage } from './pages/ClasesPage';
import { PerfilPage } from './pages/ProfilePage';
import { Sidebar } from './components/layout/Sidebar';
import { SociosPage } from './pages/SociosPage';
import { PagosPage } from './pages/PagosPage';
import { MorososPage } from './pages/MorososPage';
import { GestionPagosPage } from './pages/GestionPagosPage';
import { Loader2 } from 'lucide-react';
import { MisClasesPage } from './pages/MisClasesPage';
import { RutinasPage } from './pages/RutinasPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { EstadisticasPage } from './pages/EstadisticasPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((state) => state.user);

  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="flex flex-1 w-full relative">
      <Sidebar />
      <div className="flex-1 min-w-0 overflow-x-hidden relative transition-all duration-300">
        {children}
      </div>
    </div>
  );
};

const AppContent = () => {
  const location = useLocation();
  const { checkSession, isLoading } = useAuthStore();

  const isPublicRoute = location.pathname === '/' || location.pathname === '/registro' || location.pathname === '/reset-password';

  useEffect(() => {
    checkSession();
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [checkSession]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-neutral-950 via-red-900/10 to-neutral-950 z-0"></div>
        <div className="relative z-10 flex flex-col items-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="relative">
            <div className="absolute inset-0 bg-fitbox-red blur-2xl opacity-20 animate-pulse"></div>
            <h1 className="text-6xl font-black text-white italic tracking-tighter relative z-10 uppercase">
              FIT<span className="text-fitbox-red">BOX</span>
            </h1>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-10 h-10 text-fitbox-red animate-spin" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">
              Cargando aplicación...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-fitbox-bg text-fitbox-text font-sans transition-colors duration-300">
      {!isPublicRoute && <Header />}
      <main className="grow flex flex-col">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><PerfilPage /></ProtectedRoute>} />
          <Route path="/socios" element={<ProtectedRoute><SociosPage /></ProtectedRoute>} />
          <Route path="/maquinas" element={<ProtectedRoute><MaquinasPage /></ProtectedRoute>} />
          <Route path="/clases" element={<ProtectedRoute><ClasesPage /></ProtectedRoute>} />
          <Route path="/rutinas" element={<ProtectedRoute><RutinasPage /></ProtectedRoute>} />
          <Route path="/mis-clases" element={<ProtectedRoute><MisClasesPage /></ProtectedRoute>} />
          <Route path="/pagos" element={<ProtectedRoute><PagosPage /></ProtectedRoute>} />
          <Route path="/morosos" element={<ProtectedRoute><MorososPage /></ProtectedRoute>} />
          <Route path="/gestion-pagos" element={<ProtectedRoute><GestionPagosPage /></ProtectedRoute>} />
          <Route path="/estadisticas" element={<ProtectedRoute><EstadisticasPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isPublicRoute && <Footer />}
    </div>
  );
};

export const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;