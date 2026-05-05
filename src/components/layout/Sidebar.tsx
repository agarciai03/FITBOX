import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Calendar, Dumbbell, ClipboardList, Wrench, CreditCard, Activity, ChevronLeft, ChevronRight, X } from 'lucide-react';

export const Sidebar = () => {
    const profile = useAuthStore((state) => state.profile);
    const isMobileMenuOpen = useAuthStore((state) => state.isMobileMenuOpen); 
    const closeMobileMenu = useAuthStore((state) => state.closeMobileMenu);   

    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;

    const [isCollapsed, setIsCollapsed] = useState(false);
    const rol = profile?.roles?.nombre_rol || 'Socio';

    // Función que navega y, si estamos en móvil, cierra el menú automáticamente
    const handleNavigation = (path: string) => {
        navigate(path);
        closeMobileMenu();
    };

    return (
        <>
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={closeMobileMenu}
                />
            )}

            {/* sidebar responsive */}

            <aside className={`fixed md:relative z-50 bg-neutral-950 md:bg-neutral-950/40 backdrop-blur-md border-r border-neutral-800/50 min-h-screen p-4 flex flex-col transition-all duration-300 
                ${isCollapsed ? 'md:w-20 md:items-center' : 'w-64'} 
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>

                <div className={`flex items-center mb-6 w-full ${isCollapsed ? 'md:justify-center' : 'justify-between'}`}>
                    {!isCollapsed && (
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider truncate">
                            Menú - {rol}
                        </p>
                    )}

                    <div className="flex gap-2">
                        {/* Botón colapsar */}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-neutral-800/50 hidden md:block"
                            title={isCollapsed ? "Expandir menú" : "Ocultar menú"}
                        >
                            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                        </button>

                        {/* Botón cerrar */}
                        <button
                            onClick={closeMobileMenu}
                            className="md:hidden text-gray-400 hover:text-white p-1"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <nav className="flex flex-col gap-2 w-full overflow-y-auto pb-20 scrollbar-hide">
                    {/* Botones de Navegación usando handleNavigation en lugar de navigate */}
                    <button
                        title="Inicio"
                        onClick={() => handleNavigation('/dashboard')}
                        className={`flex items-center p-3 rounded-lg font-bold transition-all overflow-hidden ${pathname === '/dashboard'
                            ? 'bg-fitbox-red/10 text-fitbox-red border border-fitbox-red/20'
                            : 'text-gray-400 hover:bg-fitbox-red/5 hover:text-fitbox-red'
                            } ${isCollapsed ? 'md:justify-center' : 'gap-3 text-left'}`}
                    >
                        <Home className="w-5 h-5 shrink-0" />
                        <span className={`${isCollapsed ? 'md:hidden' : 'truncate'}`}>Inicio</span>
                    </button>

                    {(rol === 'Administrador' || rol === 'Monitor') && (
                        <button
                            title="Control de Caja"
                            onClick={() => handleNavigation('/gestion-pagos')}
                            className={`flex items-center p-3 rounded-lg font-bold transition-all overflow-hidden ${pathname === '/gestion-pagos'
                                ? 'bg-fitbox-red/10 text-fitbox-red border border-fitbox-red/20'
                                : 'text-gray-400 hover:bg-fitbox-red/5 hover:text-fitbox-red'
                                } ${isCollapsed ? 'md:justify-center' : 'gap-3 text-left'}`}
                        >
                            <CreditCard className="w-5 h-5 shrink-0" />
                            <span className={`${isCollapsed ? 'md:hidden' : 'truncate'}`}>Control de Caja</span>
                        </button>
                    )}

                    {rol === 'Administrador' && (
                        <>
                            <button
                                title="Gestión de Usuarios"
                                onClick={() => handleNavigation('/socios')}
                                className={`flex items-center p-3 rounded-lg font-bold transition-all overflow-hidden ${pathname === '/socios'
                                    ? 'bg-fitbox-red/10 text-fitbox-red border border-fitbox-red/20'
                                    : 'text-gray-400 hover:bg-fitbox-red/5 hover:text-fitbox-red'
                                    } ${isCollapsed ? 'md:justify-center' : 'gap-3 text-left'}`}
                            >
                                <Users className="w-5 h-5 shrink-0" />
                                <span className={`${isCollapsed ? 'md:hidden' : 'truncate'}`}>Gestión de Usuarios</span>
                            </button>

                            <button
                                title="Gestión de Horarios"
                                onClick={() => handleNavigation('/clases')}
                                className={`flex items-center p-3 rounded-lg font-bold transition-all overflow-hidden ${pathname === '/clases'
                                    ? 'bg-fitbox-red/10 text-fitbox-red border border-fitbox-red/20'
                                    : 'text-gray-400 hover:bg-fitbox-red/5 hover:text-fitbox-red'
                                    } ${isCollapsed ? 'md:justify-center' : 'gap-3 text-left'}`}
                            >
                                <Calendar className="w-5 h-5 shrink-0" />
                                <span className={`${isCollapsed ? 'md:hidden' : 'truncate'}`}>Gestión de Horarios</span>
                            </button>
                            <button
                                title="Planes de Entrenamiento"
                                onClick={() => handleNavigation('/rutinas')}
                                className={`flex items-center p-3 rounded-lg font-bold transition-all overflow-hidden ${pathname === '/rutinas'
                                    ? 'bg-fitbox-red/10 text-fitbox-red border border-fitbox-red/20'
                                    : 'text-gray-400 hover:bg-fitbox-red/5 hover:text-fitbox-red'
                                    } ${isCollapsed ? 'md:justify-center' : 'gap-3 text-left'}`}
                            >
                                <Activity className="w-5 h-5 shrink-0" />
                                <span className={`${isCollapsed ? 'md:hidden' : 'truncate'}`}>Planes de Entrenamiento</span>
                            </button>
                            <button
                                title="Inventario"
                                onClick={() => handleNavigation('/maquinas')}
                                className={`flex items-center p-3 rounded-lg font-bold transition-all overflow-hidden ${pathname === '/maquinas'
                                    ? 'bg-fitbox-red/10 text-fitbox-red border border-fitbox-red/20'
                                    : 'text-gray-400 hover:bg-fitbox-red/5 hover:text-fitbox-red'
                                    } ${isCollapsed ? 'md:justify-center' : 'gap-3 text-left'}`}
                            >
                                <Dumbbell className="w-5 h-5 shrink-0" />
                                <span className={`${isCollapsed ? 'md:hidden' : 'truncate'}`}>Inventario</span>
                            </button>
                        </>
                    )}

                    {rol === 'Monitor' && (
                        <>
                            <button
                                title="Horarios y Clases"
                                onClick={() => handleNavigation('/clases')}
                                className={`flex items-center p-3 rounded-lg font-bold transition-all overflow-hidden ${pathname === '/clases'
                                    ? 'bg-fitbox-red/10 text-fitbox-red border border-fitbox-red/20'
                                    : 'text-gray-400 hover:bg-fitbox-red/5 hover:text-fitbox-red'
                                    } ${isCollapsed ? 'md:justify-center' : 'gap-3 text-left'}`}
                            >
                                <Calendar className="w-5 h-5 shrink-0" />
                                <span className={`${isCollapsed ? 'md:hidden' : 'truncate'}`}>Horarios y Clases</span>
                            </button>
                            <button
                                title="Mis Clases (Pasar Lista)"
                                onClick={() => handleNavigation('/mis-clases')}
                                className={`flex items-center p-3 rounded-lg font-bold transition-all overflow-hidden ${pathname === '/mis-clases'
                                    ? 'bg-fitbox-red/10 text-fitbox-red border border-fitbox-red/20'
                                    : 'text-gray-400 hover:bg-fitbox-red/5 hover:text-fitbox-red'
                                    } ${isCollapsed ? 'md:justify-center' : 'gap-3 text-left'}`}
                            >
                                <ClipboardList className="w-5 h-5 shrink-0" />
                                <span className={`${isCollapsed ? 'md:hidden' : 'truncate'}`}>Mis Clases (Pasar Lista)</span>
                            </button>
                            <button
                                title="Planes de Entrenamiento"
                                onClick={() => handleNavigation('/rutinas')}
                                className={`flex items-center p-3 rounded-lg font-bold transition-all overflow-hidden ${pathname === '/rutinas'
                                    ? 'bg-fitbox-red/10 text-fitbox-red border border-fitbox-red/20'
                                    : 'text-gray-400 hover:bg-fitbox-red/5 hover:text-fitbox-red'
                                    } ${isCollapsed ? 'md:justify-center' : 'gap-3 text-left'}`}
                            >
                                <Activity className="w-5 h-5 shrink-0" />
                                <span className={`${isCollapsed ? 'md:hidden' : 'truncate'}`}>Planes de Entrenamiento</span>
                            </button>
                            <button
                                title="Reportar Avería"
                                onClick={() => handleNavigation('/maquinas')}
                                className={`flex items-center p-3 rounded-lg font-bold transition-all overflow-hidden ${pathname === '/maquinas'
                                    ? 'bg-fitbox-red/10 text-fitbox-red border border-fitbox-red/20'
                                    : 'text-gray-400 hover:bg-fitbox-red/5 hover:text-fitbox-red'
                                    } ${isCollapsed ? 'md:justify-center' : 'gap-3 text-left'}`}
                            >
                                <Wrench className="w-5 h-5 shrink-0" />
                                <span className={`${isCollapsed ? 'md:hidden' : 'truncate'}`}>Reportar Avería</span>
                            </button>
                        </>
                    )}

                    {rol === 'Socio' && (
                        <>
                            <button
                                title="Horarios y Reservas"
                                onClick={() => handleNavigation('/clases')}
                                className={`flex items-center p-3 rounded-lg font-bold transition-all overflow-hidden ${pathname === '/clases'
                                    ? 'bg-fitbox-red/10 text-fitbox-red border border-fitbox-red/20'
                                    : 'text-gray-400 hover:bg-fitbox-red/5 hover:text-fitbox-red'
                                    } ${isCollapsed ? 'md:justify-center' : 'gap-3 text-left'}`}
                            >
                                <Calendar className="w-5 h-5 shrink-0" />
                                <span className={`${isCollapsed ? 'md:hidden' : 'truncate'}`}>Horarios y Reservas</span>
                            </button>
                            <button
                                title="Planes de Entrenamiento"
                                onClick={() => handleNavigation('/rutinas')}
                                className={`flex items-center p-3 rounded-lg font-bold transition-all overflow-hidden ${pathname === '/rutinas'
                                    ? 'bg-fitbox-red/10 text-fitbox-red border border-fitbox-red/20'
                                    : 'text-gray-400 hover:bg-fitbox-red/5 hover:text-fitbox-red'
                                    } ${isCollapsed ? 'md:justify-center' : 'gap-3 text-left'}`}
                            >
                                <Activity className="w-5 h-5 shrink-0" />
                                <span className={`${isCollapsed ? 'md:hidden' : 'truncate'}`}>Planes de Entrenamiento</span>
                            </button>
                            <button
                                title="Mis Pagos"
                                onClick={() => handleNavigation('/pagos')}
                                className={`flex items-center p-3 rounded-lg font-bold transition-all overflow-hidden ${pathname === '/pagos'
                                    ? 'bg-fitbox-red/10 text-fitbox-red border border-fitbox-red/20'
                                    : 'text-gray-400 hover:bg-fitbox-red/5 hover:text-fitbox-red'
                                    } ${isCollapsed ? 'md:justify-center' : 'gap-3 text-left'}`}
                            >
                                <CreditCard className="w-5 h-5 shrink-0" />
                                <span className={`${isCollapsed ? 'md:hidden' : 'truncate'}`}>Mis Pagos</span>
                            </button>
                        </>
                    )}
                </nav>
            </aside>
        </>
    );
};