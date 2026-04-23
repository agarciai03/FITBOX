import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Calendar, Dumbbell, ClipboardList, Wrench, CreditCard, Activity, ChevronLeft, ChevronRight } from 'lucide-react';

export const Sidebar = () => {
    const profile = useAuthStore((state) => state.profile);
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;

    const [isCollapsed, setIsCollapsed] = useState(false);
    const rol = profile?.roles?.nombre_rol || 'Socio';

    return (
        // EFECTO CRISTAL LATERAL
        <aside className={`bg-neutral-950/40 backdrop-blur-md border-r border-neutral-800/50 min-h-screen p-4 hidden md:flex md:flex-col transition-all duration-300 relative ${isCollapsed ? 'w-20 items-center' : 'w-64'}`}>

            <div className={`flex items-center mb-6 w-full ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                {!isCollapsed && (
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider truncate">
                        Menú - {rol}
                    </p>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-neutral-800/50"
                    title={isCollapsed ? "Expandir menú" : "Ocultar menú"}
                >
                    {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
            </div>

            <nav className="flex flex-col gap-2 w-full">
                <button
                    title="Inicio"
                    onClick={() => navigate('/dashboard')}
                    className={`flex items-center p-3 rounded-lg font-bold transition-all overflow-hidden ${pathname === '/dashboard'
                        ? 'bg-fitbox-red/10 text-fitbox-red border border-fitbox-red/20'
                        : 'text-gray-400 hover:bg-fitbox-red/5 hover:text-fitbox-red'
                        } ${isCollapsed ? 'justify-center' : 'gap-3 text-left'}`}
                >
                    <Home className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span className="truncate">Inicio</span>}
                </button>

                {(rol === 'Administrador' || rol === 'Monitor') && (
                    <button
                        title="Control de Caja"
                        onClick={() => navigate('/gestion-pagos')}
                        className={`flex items-center p-3 rounded-lg font-bold transition-all overflow-hidden ${pathname === '/gestion-pagos'
                            ? 'bg-fitbox-red/10 text-fitbox-red border border-fitbox-red/20'
                            : 'text-gray-400 hover:bg-fitbox-red/5 hover:text-fitbox-red'
                            } ${isCollapsed ? 'justify-center' : 'gap-3 text-left'}`}
                    >
                        <CreditCard className="w-5 h-5 shrink-0" />
                        {!isCollapsed && <span className="truncate">Control de Caja</span>}
                    </button>
                )}

                {rol === 'Administrador' && (
                    <>
                        <button
                            title="Gestión de Usuarios"
                            onClick={() => navigate('/socios')}
                            className={`flex items-center p-3 rounded-lg font-bold transition-all overflow-hidden ${pathname === '/socios'
                                ? 'bg-fitbox-red/10 text-fitbox-red border border-fitbox-red/20'
                                : 'text-gray-400 hover:bg-fitbox-red/5 hover:text-fitbox-red'
                                } ${isCollapsed ? 'justify-center' : 'gap-3 text-left'}`}
                        >
                            <Users className="w-5 h-5 shrink-0" />
                            {!isCollapsed && <span className="truncate">Gestión de Usuarios</span>}
                        </button>

                        <button
                            title="Gestión de Horarios"
                            onClick={() => navigate('/clases')}
                            className={`flex items-center p-3 rounded-lg font-bold transition-all overflow-hidden ${pathname === '/clases'
                                ? 'bg-fitbox-red/10 text-fitbox-red border border-fitbox-red/20'
                                : 'text-gray-400 hover:bg-fitbox-red/5 hover:text-fitbox-red'
                                } ${isCollapsed ? 'justify-center' : 'gap-3 text-left'}`}
                        >
                            <Calendar className="w-5 h-5 shrink-0" />
                            {!isCollapsed && <span className="truncate">Gestión de Horarios</span>}
                        </button>
                        <button
                            title="Planes de Entrenamiento"
                            onClick={() => navigate('/rutinas')}
                            className={`flex items-center p-3 rounded-lg font-bold transition-all overflow-hidden ${pathname === '/rutinas'
                                ? 'bg-fitbox-red/10 text-fitbox-red border border-fitbox-red/20'
                                : 'text-gray-400 hover:bg-fitbox-red/5 hover:text-fitbox-red'
                                } ${isCollapsed ? 'justify-center' : 'gap-3 text-left'}`}
                        >
                            <Activity className="w-5 h-5 shrink-0" />
                            {!isCollapsed && <span className="truncate">Planes de Entrenamiento</span>}
                        </button>
                        <button
                            title="Inventario"
                            onClick={() => navigate('/maquinas')}
                            className={`flex items-center p-3 rounded-lg font-bold transition-all overflow-hidden ${pathname === '/maquinas'
                                ? 'bg-fitbox-red/10 text-fitbox-red border border-fitbox-red/20'
                                : 'text-gray-400 hover:bg-fitbox-red/5 hover:text-fitbox-red'
                                } ${isCollapsed ? 'justify-center' : 'gap-3 text-left'}`}
                        >
                            <Dumbbell className="w-5 h-5 shrink-0" />
                            {!isCollapsed && <span className="truncate">Inventario</span>}
                        </button>
                    </>
                )}

                {rol === 'Monitor' && (
                    <>
                        <button
                            title="Horarios y Clases"
                            onClick={() => navigate('/clases')}
                            className={`flex items-center p-3 rounded-lg font-bold transition-all overflow-hidden ${pathname === '/clases'
                                ? 'bg-fitbox-red/10 text-fitbox-red border border-fitbox-red/20'
                                : 'text-gray-400 hover:bg-fitbox-red/5 hover:text-fitbox-red'
                                } ${isCollapsed ? 'justify-center' : 'gap-3 text-left'}`}
                        >
                            <Calendar className="w-5 h-5 shrink-0" />
                            {!isCollapsed && <span className="truncate">Horarios y Clases</span>}
                        </button>
                        <button
                            title="Mis Clases (Pasar Lista)"
                            onClick={() => navigate('/mis-clases')}
                            className={`flex items-center p-3 rounded-lg font-bold transition-all overflow-hidden ${pathname === '/mis-clases'
                                ? 'bg-fitbox-red/10 text-fitbox-red border border-fitbox-red/20'
                                : 'text-gray-400 hover:bg-fitbox-red/5 hover:text-fitbox-red'
                                } ${isCollapsed ? 'justify-center' : 'gap-3 text-left'}`}
                        >
                            <ClipboardList className="w-5 h-5 shrink-0" />
                            {!isCollapsed && <span className="truncate">Mis Clases (Pasar Lista)</span>}
                        </button>
                        <button
                            title="Planes de Entrenamiento"
                            onClick={() => navigate('/rutinas')}
                            className={`flex items-center p-3 rounded-lg font-bold transition-all overflow-hidden ${pathname === '/rutinas'
                                ? 'bg-fitbox-red/10 text-fitbox-red border border-fitbox-red/20'
                                : 'text-gray-400 hover:bg-fitbox-red/5 hover:text-fitbox-red'
                                } ${isCollapsed ? 'justify-center' : 'gap-3 text-left'}`}
                        >
                            <Activity className="w-5 h-5 shrink-0" />
                            {!isCollapsed && <span className="truncate">Planes de Entrenamiento</span>}
                        </button>
                        <button
                            title="Reportar Avería"
                            onClick={() => navigate('/maquinas')}
                            className={`flex items-center p-3 rounded-lg font-bold transition-all overflow-hidden ${pathname === '/maquinas'
                                ? 'bg-fitbox-red/10 text-fitbox-red border border-fitbox-red/20'
                                : 'text-gray-400 hover:bg-fitbox-red/5 hover:text-fitbox-red'
                                } ${isCollapsed ? 'justify-center' : 'gap-3 text-left'}`}
                        >
                            <Wrench className="w-5 h-5 shrink-0" />
                            {!isCollapsed && <span className="truncate">Reportar Avería</span>}
                        </button>
                    </>
                )}

                {rol === 'Socio' && (
                    <>
                        <button
                            title="Horarios y Reservas"
                            onClick={() => navigate('/clases')}
                            className={`flex items-center p-3 rounded-lg font-bold transition-all overflow-hidden ${pathname === '/clases'
                                ? 'bg-fitbox-red/10 text-fitbox-red border border-fitbox-red/20'
                                : 'text-gray-400 hover:bg-fitbox-red/5 hover:text-fitbox-red'
                                } ${isCollapsed ? 'justify-center' : 'gap-3 text-left'}`}
                        >
                            <Calendar className="w-5 h-5 shrink-0" />
                            {!isCollapsed && <span className="truncate">Horarios y Reservas</span>}
                        </button>
                        <button
                            title="Planes de Entrenamiento"
                            onClick={() => navigate('/rutinas')}
                            className={`flex items-center p-3 rounded-lg font-bold transition-all overflow-hidden ${pathname === '/rutinas'
                                ? 'bg-fitbox-red/10 text-fitbox-red border border-fitbox-red/20'
                                : 'text-gray-400 hover:bg-fitbox-red/5 hover:text-fitbox-red'
                                } ${isCollapsed ? 'justify-center' : 'gap-3 text-left'}`}
                        >
                            <Activity className="w-5 h-5 shrink-0" />
                            {!isCollapsed && <span className="truncate">Planes de Entrenamiento</span>}
                        </button>
                        <button
                            title="Mis Pagos"
                            onClick={() => navigate('/pagos')}
                            className={`flex items-center p-3 rounded-lg font-bold transition-all overflow-hidden ${pathname === '/pagos'
                                ? 'bg-fitbox-red/10 text-fitbox-red border border-fitbox-red/20'
                                : 'text-gray-400 hover:bg-fitbox-red/5 hover:text-fitbox-red'
                                } ${isCollapsed ? 'justify-center' : 'gap-3 text-left'}`}
                        >
                            <CreditCard className="w-5 h-5 shrink-0" />
                            {!isCollapsed && <span className="truncate">Mis Pagos</span>}
                        </button>
                    </>
                )}
            </nav>
        </aside>
    );
};