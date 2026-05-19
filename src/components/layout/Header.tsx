import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Globe, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();

    const user = useAuthStore((state) => state.user);
    const profile = useAuthStore((state) => state.profile);
    const toggleMobileMenu = useAuthStore((state) => state.toggleMobileMenu); 
    const esRutaPublica = location.pathname === '/' || location.pathname === '/registro';

    const irAlInicio = () => {
        if (user) navigate('/dashboard');
        else navigate('/');
    };

    const [isDark] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved === 'light' ? false : true;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            root.classList.remove('light');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.add('light');
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const [idioma, setIdioma] = useState(() => {
        return localStorage.getItem('lang') || 'ES';
    });

    const toggleIdioma = () => {
        const nuevoIdioma = idioma === 'ES' ? 'EN' : 'ES';
        setIdioma(nuevoIdioma);
        localStorage.setItem('lang', nuevoIdioma);
        i18n.changeLanguage(nuevoIdioma);
    };

    return (
        <header className="bg-neutral-950/60 backdrop-blur-xl border-b border-neutral-800/50 p-4 sticky top-0 z-50 transition-colors duration-300">
            <div className="w-full px-2 flex justify-between items-center">

                <div className="flex items-center gap-3">
                    {user && !esRutaPublica && (
                        <button
                            onClick={toggleMobileMenu}
                            className="md:hidden text-gray-400 hover:text-white transition-colors p-1"
                        >
                            <Menu className="size-6" />
                        </button>
                    )}

                    <h1
                        className="flex items-center gap-3 text-2xl font-extrabold text-white cursor-pointer hover:opacity-80 transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-fitbox-red rounded-lg"
                        onClick={irAlInicio}
                        onKeyDown={(e) => { if (e.key === 'Enter') irAlInicio(); }}
                        tabIndex={0}
                        role="button"
                        aria-label="Ir al inicio"
                    >
                        <img src="/favicon.png" alt="Logo FITBOX" className="h-12 w-auto object-contain hidden sm:block" />
                        <span>FIT<span className="text-fitbox-red">BOX</span></span>
                    </h1>
                </div>

                <div className="flex items-center gap-4 sm:gap-6">
                    {user && !esRutaPublica && (
                        <div className="flex items-center gap-2 border-r border-neutral-700 pr-4 sm:pr-6">
                            <button
                                onClick={toggleIdioma}
                                className="flex items-center gap-1 p-2 text-gray-400 hover:text-fitbox-red hover:bg-neutral-800/50 rounded-full transition-all font-bold text-xs"
                            >
                                <Globe className="size-5" />
                                <span className="hidden sm:inline-block">{idioma}</span>
                            </button>
                        </div>
                    )}

                    {user && !esRutaPublica && (
                        <Link to="/perfil" className="flex items-center gap-2 group cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-fitbox-red rounded-full p-1">
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                                    {t('menu.mi_cuenta', 'Mi Cuenta')}
                                </p>
                                <p className="text-sm text-white group-hover:text-fitbox-red transition-colors capitalize">
                                    {profile?.nombre || user.email}
                                </p>
                            </div>

                            <Avatar className="size-10 border border-neutral-700 transition-colors group-hover:border-fitbox-red">
                                {profile?.avatar_url && (
                                    <AvatarImage src={profile.avatar_url} className="object-cover" />
                                )}
                                <AvatarFallback className="bg-neutral-800 text-white font-bold group-hover:text-fitbox-red">
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