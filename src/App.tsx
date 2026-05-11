import React, { useEffect, useState } from 'react';
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
import { GestionPagosPage } from './pages/GestionPagosPage';
import { Card } from './components/ui/Card';
import { Input } from './components/ui/Input';
import { Button } from './components/ui/Button';
import { CreditCard, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from './database/supabase/Client';
import { PaymentRepository } from './database/repositories/PaymentRepository';
import { MisClasesPage } from './pages/MisClasesPage';
import { RutinasPage } from './pages/RutinasPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { EstadisticasPage } from './pages/EstadisticasPage';

// Modal bloqueador tipo Stripe 
const PaymentModal = ({ profile }: { profile: any }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { checkSession } = useAuthStore();

  const handlePay = async () => {
    setError(null);
    setLoading(true);

    setTimeout(async () => {
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard === '4242424242424242') {
        setSuccess(true);
        try {
          await supabase.from('usuarios').update({ estado_pago: 'activo' }).eq('id_usuario', profile.id_usuario);
          await PaymentRepository.registrarPago(profile.id_usuario, 19.99, "Membresía Mensual FITBOX");
          setTimeout(() => { checkSession(); }, 2000);
        } catch (err) {
          console.error("Error al procesar alta de pago:", err);
        }
      } else {
        setError('Tarjeta denegada. Usa la tarjeta de prueba: 4242 4242 4242 4242');
        setLoading(false);
      }
    }, 2000);
  };

  if (success) {
    return (
      <Card className="p-8 max-w-md w-full bg-green-900/20 border-green-500 flex flex-col items-center justify-center space-y-4 animate-in zoom-in duration-500 shadow-2xl shadow-green-500/20">
        <CheckCircle className="w-20 h-20 text-green-500 animate-bounce" />
        <h2 className="text-2xl font-black text-white text-center uppercase tracking-tight">¡Pago Completado!</h2>
        <p className="text-green-400 text-center font-medium">Tu membresía ha sido activada. Redirigiendo a tu entorno...</p>
      </Card>
    );
  }

  return (
    <Card className="p-8 max-w-md w-full bg-neutral-950 border-neutral-800 flex flex-col items-center shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-8">
      <div className="w-16 h-16 bg-fitbox-red rounded-full flex items-center justify-center mb-6 shadow-lg shadow-fitbox-red/50">
        <CreditCard className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-1">Membresía <span className="text-fitbox-red">FITBOX</span></h2>
      <p className="text-gray-400 text-sm text-center mb-8">Para acceder a la plataforma debes completar el pago de tu cuota mensual de inscripción.</p>

      {error && <div className="w-full p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg mb-6 flex items-center gap-2 text-sm font-bold"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</div>}

      <div className="w-full space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Número de tarjeta (Usa 4242...)</label>
          <Input placeholder="0000 0000 0000 0000" maxLength={19} className="bg-neutral-900 border-neutral-800 text-lg tracking-widest font-mono" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
        </div>
        <div className="flex gap-4">
          <div className="space-y-1 flex-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Caducidad</label>
            <Input placeholder="MM/YY" maxLength={5} className="bg-neutral-900 border-neutral-800 font-mono" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
          </div>
          <div className="space-y-1 flex-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">CVC</label>
            <Input placeholder="123" maxLength={3} type="password" className="bg-neutral-900 border-neutral-800 font-mono" value={cvc} onChange={(e) => setCvc(e.target.value)} />
          </div>
        </div>
        <Button onClick={handlePay} disabled={loading} className="w-full bg-fitbox-red hover:bg-red-700 text-white font-black py-6 text-lg mt-4 shadow-lg">
          {loading ? 'PROCESANDO PAGO...' : 'PAGAR 19.99 €'}
        </Button>
      </div>
    </Card>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);

  if (!user) return <Navigate to="/" replace />;

  const isSocio = profile?.roles?.nombre_rol === 'Socio';
  const isPendiente = (profile as any)?.estado_pago === 'pendiente';

  return (
    <div className="flex flex-1 w-full relative">
      <Sidebar />
      <div className="flex-1 min-w-0 overflow-x-hidden relative transition-all duration-300">
        {children}
        {isSocio && isPendiente && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <PaymentModal profile={profile} />
          </div>
        )}
      </div>
    </div>
  );
};

const AppContent = () => {
  const location = useLocation();
  const { checkSession, isLoading } = useAuthStore();

  // /reset-password como ruta pública para que no pida login
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
        {/* Fondo sutil integrado */}
        <div className="absolute inset-0 bg-linear-to-br from-neutral-950 via-red-900/10 to-neutral-950 z-0"></div>

        <div className="relative z-10 flex flex-col items-center space-y-8 animate-in fade-in zoom-in duration-500">
          {/* Logo con efecto */}
          <div className="relative">
            <div className="absolute inset-0 bg-fitbox-red blur-2xl opacity-20 animate-pulse"></div>
            <h1 className="text-6xl font-black text-white italic tracking-tighter relative z-10 uppercase">
              FIT<span className="text-fitbox-red">BOX</span>
            </h1>
          </div>

          {/* Spinner y Texto */}
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
          <Route path="/reset-password" element={<ResetPasswordPage />} /> {/* <-- NUEVA RUTA */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><PerfilPage /></ProtectedRoute>} />
          <Route path="/socios" element={<ProtectedRoute><SociosPage /></ProtectedRoute>} />
          <Route path="/maquinas" element={<ProtectedRoute><MaquinasPage /></ProtectedRoute>} />
          <Route path="/clases" element={<ProtectedRoute><ClasesPage /></ProtectedRoute>} />
          <Route path="/rutinas" element={<ProtectedRoute><RutinasPage /></ProtectedRoute>} />
          <Route path="/mis-clases" element={<ProtectedRoute><MisClasesPage /></ProtectedRoute>} />
          <Route path="/pagos" element={<ProtectedRoute><PagosPage /></ProtectedRoute>} />
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