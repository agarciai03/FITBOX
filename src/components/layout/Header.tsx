import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // SACAR DATOS EN ZUSTAND
    const user = useAuthStore((state) => state.user);
    const profile = useAuthStore((state) => state.profile);

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
            <div className="w-full px-2 flex justify-between items-center">

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
                    {/* ENLACE AL PERFIL (Solo si hay usuario y no es login/registro) */}
                    {user && !esRutaPublica && (
                        <Link
                            to="/perfil"
                            className="flex items-center gap-2 group cursor-pointer"
                        >
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] text-fitbox-text-muted uppercase font-bold tracking-wider">Mi Cuenta</p>
                                {/* AÑADIDO: Muestra el nombre del perfil, si no hay nombre muestra el email como respaldo */}
                                <p className="text-sm text-white group-hover:text-fitbox-red transition-colors capitalize">
                                    {profile?.nombre || user.email}
                                </p>
                            </div>

                            {/* Avatar en el Header */}
                            <Avatar className="w-10 h-10 border border-neutral-700 transition-colors group-hover:border-fitbox-red">
                                {profile?.avatar_url && (
                                    <AvatarImage src={profile.avatar_url} className="object-cover" />
                                )}
                                <AvatarFallback className="bg-neutral-800 text-fitbox-text-muted font-bold group-hover:text-fitbox-red">
                                    {profile?.nombre?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};