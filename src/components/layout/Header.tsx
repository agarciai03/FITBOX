import { useNavigate, useLocation, Link } from 'react-router-dom'; // Añadimos Link
import { Home, UserCircle } from 'lucide-react'; // Añadimos UserCircle
import { useAuthStore } from '../../store/authStore';

export const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useAuthStore((state) => state.user);

    const mostrarBotonHome = user &&
        location.pathname !== '/dashboard' &&
        location.pathname !== '/' &&
        location.pathname !== '/registro';

    const esRutaPublica = location.pathname === '/' || location.pathname === '/registro';

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

                {/* LOGO */}
                <h1
                    className="flex items-center gap-3 text-2xl font-extrabold text-white cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={irAlInicio}
                >
                    <img
                        src="/favicon.png"
                        alt="Logo FITBOX"
                        className="h-12 w-auto object-contain"
                    />
                    <span>FIT<span className="text-fitbox-red">BOX</span></span>
                </h1>

                <div className="flex items-center gap-6">
                    {/* BOTÓN "VOLVER AL INICIO" */}
                    {mostrarBotonHome && (
                        <button
                            onClick={irAlInicio}
                            className="flex items-center gap-2 text-fitbox-text-muted hover:text-white bg-neutral-900 hover:bg-neutral-800 px-4 py-2 rounded-lg border border-neutral-800 transition-colors"
                        >
                            <Home className="w-5 h-5" />
                            <span className="hidden sm:inline font-medium">Volver al inicio</span>
                        </button>
                    )}

                    {/* ENLACE AL PERFIL (Solo si hay usuario y no es login/registro) */}
                    {user && !esRutaPublica && (
                        <Link
                            to="/perfil"
                            className="flex items-center gap-2 group cursor-pointer"
                        >
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] text-fitbox-text-muted uppercase font-bold tracking-wider">Mi Cuenta</p>
                                <p className="text-sm text-white group-hover:text-fitbox-red transition-colors">{user.email}</p>
                            </div>
                            <UserCircle className="w-8 h-8 text-fitbox-text-muted group-hover:text-fitbox-red transition-colors" />
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};