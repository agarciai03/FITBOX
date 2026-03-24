import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';

export const Header = () => {
    // Leemos el estado global de Zustand
    const { user, logout } = useAuthStore();

    return (
        <header className="bg-fitbox-card border-b border-neutral-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Logo del gimnasio */}
                    <div className="flex-shrink-0 flex items-center">
                        <h1 className="text-2xl font-extrabold text-white tracking-tight">
                            FIT<span className="text-fitbox-red">BOX</span>
                        </h1>
                    </div>

                    {/* Acciones: Solo se muestran si el usuario ya ha hecho Login */}
                    {user && (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-fitbox-text-muted hidden sm:block">
                                {user.email}
                            </span>
                            <Button variant="ghost" onClick={logout}>
                                Cerrar Sesión
                            </Button>
                        </div>
                    )}

                </div>
            </div>
        </header>
    );
};