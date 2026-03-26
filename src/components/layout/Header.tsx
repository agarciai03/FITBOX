import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import FitboxLogo from '../../assets/Fitbox.png';

export const Header = () => {
    // Leemos el estado global de Zustand
    const { user, logout } = useAuthStore();

    return (
        <header className="bg-fitbox-card border-b border-neutral-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    <div className="shrink-0 flex items-center">
                        <img
                            src={FitboxLogo}
                            alt="FITBOX - Tu Gimnasio Inteligente"
                            className="h-9 w-auto "
                        />
                    </div>

                    {/* Acciones de Usuario (Lado Derecho) */}
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