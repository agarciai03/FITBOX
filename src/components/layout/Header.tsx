import { useNavigate, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Header = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Hook para saber la ruta actual
    const user = useAuthStore((state) => state.user);

    const mostrarBotonHome = user &&
        location.pathname !== '/dashboard' &&
        location.pathname !== '/' &&
        location.pathname !== '/registro';

    const irAlInicio = () => {
        if (user) {
            navigate('/dashboard');
        } else {
            navigate('/');
        }
    };

    return (
        <header className="bg-fitbox-card border-b border-neutral-800 p-4 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">

                {/* LOGO (Clicable para ir al inicio) */}
                <h1
                    className="text-2xl font-extrabold text-white cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={irAlInicio}
                >
                    FIT<span className="text-fitbox-red">BOX</span>
                </h1>

                {/* BOTÓN "VOLVER AL INICIO" (Solo en subpáginas internas) */}
                {mostrarBotonHome && (
                    <div className="flex items-center gap-4">
                        <button
                            onClick={irAlInicio}
                            className="flex items-center gap-2 text-fitbox-text-muted hover:text-white bg-neutral-900 hover:bg-neutral-800 px-4 py-2 rounded-lg border border-neutral-800 transition-colors"
                        >
                            <Home className="w-5 h-5" />
                            <span className="hidden sm:inline font-medium">Volver al inicio</span>
                        </button>
                    </div>
                )}

                {/* Si no hay botón de Home pero hay sesión, podemos mostrar el email como antes */}
                {user && !mostrarBotonHome && (
                    <div className="text-fitbox-text-muted text-sm hidden sm:block">
                        Sesión iniciada: <span className="text-white">{user.email}</span>
                    </div>
                )}

            </div>
        </header>
    );
};