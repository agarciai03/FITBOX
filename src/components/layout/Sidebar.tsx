import { useAuthStore } from '../../store/authStore';

export const Sidebar = () => {
    // Leemos el perfil completo desde Zustand
    const profile = useAuthStore((state) => state.profile);

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
                {/* Este botón lo ven todos */}
                <button className="text-left p-3 rounded-lg bg-fitbox-red/10 text-fitbox-red font-semibold hover:bg-fitbox-red/20 transition-colors">
                    🏠 Inicio
                </button>

                {/* RENDERIZADO CONDICIONAL: Solo para el Administrador */}
                {rol === 'Administrador' && (
                    <>
                        <button className="text-left p-3 rounded-lg text-fitbox-text hover:bg-neutral-800 transition-colors">
                            👥 Gestión de Socios
                        </button>
                        <button className="text-left p-3 rounded-lg text-fitbox-text hover:bg-neutral-800 transition-colors">
                            📅 Horarios y Clases
                        </button>
                        <button className="text-left p-3 rounded-lg text-fitbox-text hover:bg-neutral-800 transition-colors">
                            🏋️ Inventario
                        </button>
                    </>
                )}

                {/* RENDERIZADO CONDICIONAL: Solo para el Monitor */}
                {rol === 'Monitor' && (
                    <>
                        <button className="text-left p-3 rounded-lg text-fitbox-text hover:bg-neutral-800 transition-colors">
                            📋 Mis Clases (Pasar Lista)
                        </button>
                        <button className="text-left p-3 rounded-lg text-fitbox-text hover:bg-neutral-800 transition-colors">
                            ⚠️ Reportar Avería
                        </button>
                    </>
                )}

                {/* RENDERIZADO CONDICIONAL: Solo para el Socio */}
                {rol === 'Socio' && (
                    <>
                        <button className="text-left p-3 rounded-lg text-fitbox-text hover:bg-neutral-800 transition-colors">
                            📅 Reservar Clase
                        </button>
                        <button className="text-left p-3 rounded-lg text-fitbox-text hover:bg-neutral-800 transition-colors">
                            💳 Mis Pagos
                        </button>
                    </>
                )}
            </nav>
        </aside>
    );
};