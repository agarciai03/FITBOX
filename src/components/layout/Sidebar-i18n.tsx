import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Users, Calendar, Dumbbell, ClipboardList, Wrench, CreditCard, Activity, ChevronLeft, ChevronRight, X, BarChart3, AlertTriangle } from 'lucide-react';

export const Sidebar = () => {
    const { t } = useTranslation();
    const profile = useAuthStore((state) => state.profile);
    const isMobileMenuOpen = useAuthStore((state) => state.isMobileMenuOpen);
    const closeMobileMenu = useAuthStore((state) => state.closeMobileMenu);

    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;

    const [isCollapsed, setIsCollapsed] = useState(false);
    
    const rol = profile?.roles?.nombre_rol || 'Socio';
    const isSocio = rol === 'Socio';
    
    const haPagado = (profile as any)?.estado_pago === 'activo';

    const handleNavigation = (path: string) => {
        navigate(path);
        closeMobileMenu();
    };

    const menuButtonClass = (isActive: boolean, collapsed: boolean) => `flex items-center p-3 rounded-lg font-bold transition-all overflow-hidden ${isActive
        ? 'bg-fitbox-red/10 text-fitbox-red border border-fitbox-red/20'
        : 'text-gray-400 hover:bg-fitbox-red/5 hover:text-fitbox-red'
        } ${collapsed ? 'md:justify-center' : 'gap-3 text-left'}`;

    return (
        <>
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={closeMobileMenu}
                />
            )}

            <aside className={`fixed z-50 bg-neutral-950 md:bg-neutral-950/40 backdrop-blur-md border-r border-neutral-800/50 min-h-screen p-4 flex flex-col transition-all duration-300 
                ${isCollapsed ? 'md:w-20 md:items-center' : 'w-64'} 
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}> 

                <div className={`flex items-center mb-6 w-full ${isCollapsed ? 'md:justify-center' : 'justify-between'}`}>
                    {!isCollapsed && (
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider truncate">
                            {t('menu.inicio')} - {rol}
                        </p>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-neutral-800/50 hidden md:block"
                            title={isCollapsed ? "Expandir" : "Ocultar"}
                        >
                            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                        </button>

                        <button
                            onClick={closeMobileMenu}
                            className="md:hidden text-gray-400 hover:text-white p-1"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <nav className="flex flex-col gap-2 w-full overflow-y-auto pb-20 scrollbar-hide">
                    {/* Botón Inicio */}
                    <button
                        title={t('menu.inicio')}
                        onClick={() => handleNavigation('/dashboard')}
                        className={menuButtonClass(pathname === '/dashboard', isCollapsed)}
                    >
                        <Home className="w-5 h-5 shrink-0" />
                        <span className={`${isCollapsed ? 'md:hidden' : 'truncate'}`}>{t('menu.inicio')}</span>
                    </button>

                    {/* Estadísticas y Caja - Admin y Monitor */}
                    {(rol === 'Administrador' || rol === 'Monitor') && (
                        <>
                            <button
                                title={t('menu.estadisticas')}
                                onClick={() => handleNavigation('/estadisticas')}
                                className={menuButtonClass(pathname === '/estadisticas', isCollapsed)}
                            >
                                <BarChart3 className="w-5 h-5 shrink-0" />
                                <span className={`${isCollapsed ? 'md:hidden' : 'truncate'}`}>{t('menu.estadisticas')}</span>
                            </button>

                            <button
                                title={t('menu.cajon_pagos')}
                                onClick={() => handleNavigation('/gestion-pagos')}
                                className={menuButtonClass(pathname === '/gestion-pagos', isCollapsed)}
                            >
                                <CreditCard className="w-5 h-5 shrink-0" />
                                <span className={`${isCollapsed ? 'md:hidden' : 'truncate'}`}>{t('menu.cajon_pagos')}</span>
                            </button>
                            
                            <button
                                title={t('menu.morosos')}
                                onClick={() => handleNavigation('/morosos')}
                                className={`${menuButtonClass(pathname === '/morosos', isCollapsed)} hover:bg-red-500/10 hover:text-red-500`}
                            >
                                <AlertTriangle className="w-5 h-5 shrink-0" />
                                <span className={`${isCollapsed ? 'md:hidden' : 'truncate'}`}>{t('menu.morosos')}</span>
                            </button>
                        </>
                    )}

                    {/* Admin solo */}
                    {rol === 'Administrador' && (
                        <>
                            <button
                                title={t('menu.gestion_usuarios')}
                                onClick={() => handleNavigation('/socios')}
                                className={menuButtonClass(pathname === '/socios', isCollapsed)}
                            >
                                <Users className="w-5 h-5 shrink-0" />
                                <span className={`${isCollapsed ? 'md:hidden' : 'truncate'}`}>{t('menu.gestion_usuarios')}</span>
                            </button>

                            <button
                                title={t('menu.gestion_horarios')}
                                onClick={() => handleNavigation('/clases')}
                                className={menuButtonClass(pathname === '/clases', isCollapsed)}
                            >
                                <Calendar className="w-5 h-5 shrink-0" />
                                <span className={`${isCollapsed ? 'md:hidden' : 'truncate'}`}>{t('menu.gestion_horarios')}</span>
                            </button>

                            <button
                                title={t('menu.rutinas')}
                                onClick={() => handleNavigation('/rutinas')}
                                className={menuButtonClass(pathname === '/rutinas', isCollapsed)}
                            >
                                <Activity className="w-5 h-5 shrink-0" />
                                <span className={`${isCollapsed ? 'md:hidden' : 'truncate'}`}>{t('menu.rutinas')}</span>
                            </button>

                            <button
                                title={t('menu.inventario')}
                                onClick={() => handleNavigation('/maquinas')}
                                className={menuButtonClass(pathname === '/maquinas', isCollapsed)}
                            >
                                <Dumbbell className="w-5 h-5 shrink-0" />
                                <span className={`${isCollapsed ? 'md:hidden' : 'truncate'}`}>{t('menu.inventario')}</span>
                            </button>
                        </>
                    )}

                    {/* Monitor solo */}
                    {rol === 'Monitor' && (
                        <>
                            <button
                                title={t('menu.gestion_horarios')}
                                onClick={() => handleNavigation('/clases')}
                                className={menuButtonClass(pathname === '/clases', isCollapsed)}
                            >
                                <Calendar className="w-5 h-5 shrink-0" />
                                <span className={`${isCollapsed ? 'md:hidden' : 'truncate'}`}>{t('menu.gestion_horarios')}</span>
                            </button>

                            <button
                                title={t('menu.mis_clases')}
                                onClick={() => handleNavigation('/mis-clases')}
                                className={menuButtonClass(pathname === '/mis-clases', isCollapsed)}
                            >
                                <ClipboardList className="w-5 h-5 shrink-0" />
                                <span className={`${isCollapsed ? 'md:hidden' : 'truncate'}`}>{t('menu.mis_clases')}</span>
                            </button>

                            <button
                                title={t('menu.rutinas')}
                                onClick={() => handleNavigation('/rutinas')}
                                className={menuButtonClass(pathname === '/rutinas', isCollapsed)}
                            >
                                <Activity className="w-5 h-5 shrink-0" />
                                <span className={`${isCollapsed ? 'md:hidden' : 'truncate'}`}>{t('menu.rutinas')}</span>
                            </button>

                            <button
                                title={t('menu.inventario')}
                                onClick={() => handleNavigation('/maquinas')}
                                className={menuButtonClass(pathname === '/maquinas', isCollapsed)}
                            >
                                <Wrench className="w-5 h-5 shrink-0" />
                                <span className={`${isCollapsed ? 'md:hidden' : 'truncate'}`}>{t('menu.inventario')}</span>
                            </button>
                        </>
                    )}

                    {/* Socio */}
                    {isSocio && (
                        <>
                            {haPagado && (
                                <>
                                    <button
                                        title={t('menu.clases')}
                                        onClick={() => handleNavigation('/clases')}
                                        className={menuButtonClass(pathname === '/clases', isCollapsed)}
                                    >
                                        <Calendar className="w-5 h-5 shrink-0" />
                                        <span className={`${isCollapsed ? 'md:hidden' : 'truncate'}`}>{t('menu.clases')}</span>
                                    </button>

                                    <button
                                        title={t('menu.rutinas')}
                                        onClick={() => handleNavigation('/rutinas')}
                                        className={menuButtonClass(pathname === '/rutinas', isCollapsed)}
                                    >
                                        <Activity className="w-5 h-5 shrink-0" />
                                        <span className={`${isCollapsed ? 'md:hidden' : 'truncate'}`}>{t('menu.rutinas')}</span>
                                    </button>

                                    <button
                                        title={t('menu.inventario')}
                                        onClick={() => handleNavigation('/maquinas')}
                                        className={menuButtonClass(pathname === '/maquinas', isCollapsed)}
                                    >
                                        <Dumbbell className="w-5 h-5 shrink-0" />
                                        <span className={`${isCollapsed ? 'md:hidden' : 'truncate'}`}>{t('menu.inventario')}</span>
                                    </button>
                                </>
                            )}

                            <button
                                title={t('menu.mis_pagos')}
                                onClick={() => handleNavigation('/pagos')}
                                className={menuButtonClass(pathname === '/pagos', isCollapsed)}
                            >
                                <CreditCard className="w-5 h-5 shrink-0" />
                                <span className={`${isCollapsed ? 'md:hidden' : 'truncate'}`}>{t('menu.mis_pagos')}</span>
                            </button>
                        </>
                    )}
                </nav>
            </aside>
        </>
    );
};
