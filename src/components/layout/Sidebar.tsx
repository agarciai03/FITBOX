import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
// Importamos los iconos de Lucide (La Navaja Suiza moderna)
import { Home, Users, Calendar, Dumbbell, ClipboardList, Wrench, CreditCard } from 'lucide-react';

export const Sidebar = () => {
    // Leemos el perfil completo desde Zustand
    const profile = useAuthStore((state) => state.profile);

    // Inicializamos el hook de navegación para poder cambiar de página
    const navigate = useNavigate();

    // Extraemos el nombre del rol de forma segura
    const rol = profile?.roles?.nombre_rol || 'Socio';

    return (
        <aside className="w-64 bg-fitbox-card border-r border-neutral-800 min-h-screen p-4 hidden md:flex md:flex-col">
            <div className="mb-6">
                <p className="text-xs font-bold text-fitbox-text-muted uppercase tracking-wider">
                    Menú - {rol}
                </p>
            </div>

            <nav className="flex flex-col gap-2">
                {/* Este botón lo ven todos (Nos lleva al Dashboard) */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-3 text-left p-3 rounded-lg bg-fitbox-red/10 text-fitbox-red font-semibold hover:bg-fitbox-red/20 transition-colors"
                >
                    <Home className="w-5 h-5" />
                    Inicio
                </button>

                {/* RENDERIZADO CONDICIONAL: Solo para el Administrador */}
                {rol === 'Administrador' && (
                    <>
                        <button
                            onClick={() => navigate('/socios')}
                            className="flex items-center gap-3 text-left p-3 rounded-lg text-fitbox-text hover:bg-neutral-800 transition-colors"
                        >
                            <Users className="w-5 h-5" />
                            Gestión de Socios
                        </button>
                        <button className="flex items-center gap-3 text-left p-3 rounded-lg text-fitbox-text hover:bg-neutral-800 transition-colors">
                            <Calendar className="w-5 h-5" />
                            Horarios y Clases
                        </button>
                        <button className="flex items-center gap-3 text-left p-3 rounded-lg text-fitbox-text hover:bg-neutral-800 transition-colors">
                            <Dumbbell className="w-5 h-5" />
                            Inventario
                        </button>
                    </>
                )}

                {/* RENDERIZADO CONDICIONAL: Solo para el Monitor */}
                {rol === 'Monitor' && (
                    <>
                        <button className="flex items-center gap-3 text-left p-3 rounded-lg text-fitbox-text hover:bg-neutral-800 transition-colors">
                            <ClipboardList className="w-5 h-5" />
                            Mis Clases (Pasar Lista)
                        </button>
                        <button className="flex items-center gap-3 text-left p-3 rounded-lg text-fitbox-text hover:bg-neutral-800 transition-colors">
                            <Wrench className="w-5 h-5" />
                            Reportar Avería
                        </button>
                    </>
                )}

                {/* RENDERIZADO CONDICIONAL: Solo para el Socio */}
                {rol === 'Socio' && (
                    <>
                        <button className="flex items-center gap-3 text-left p-3 rounded-lg text-fitbox-text hover:bg-neutral-800 transition-colors">
                            <Calendar className="w-5 h-5" />
                            Reservar Clase
                        </button>
                        <button className="flex items-center gap-3 text-left p-3 rounded-lg text-fitbox-text hover:bg-neutral-800 transition-colors">
                            <CreditCard className="w-5 h-5" />
                            Mis Pagos
                        </button>
                    </>
                )}
            </nav>
        </aside>
    );
};