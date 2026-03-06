import { useNavigate } from 'react-router-dom';
import { supabase } from '../database/supabase/Client';
import FitboxLogo from '../assets/Fitbox.png';

export default function Dashboard() {
    const navigate = useNavigate();

    // Función temporal para poder cerrar sesión y volver al login
    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#0f1115] text-white flex">

            {/* Sidebar (Menú Lateral) */}
            <aside className="w-64 bg-[#16181d] border-r border-neutral-800/60 p-6 flex flex-col">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-10">
                    <img src={FitboxLogo} alt="FITBOX" className="h-10 w-auto" />
                    <span className="text-xl font-bold tracking-wider">FITBOX</span>
                </div>

                {/* Links del menú */}
                <nav className="flex-1 space-y-2">
                    <a href="#" className="flex items-center gap-3 px-4 py-3 bg-neutral-800/50 text-white rounded-lg border border-neutral-700/50">
                        📊 Dashboard
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-white hover:bg-neutral-800/30 rounded-lg transition-colors">
                        👥 Socios
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-white hover:bg-neutral-800/30 rounded-lg transition-colors">
                        🏋️ Monitores
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-white hover:bg-neutral-800/30 rounded-lg transition-colors">
                        📅 Clases
                    </a>
                </nav>

                {/* Botón Salir */}
                <button
                    onClick={handleLogout}
                    className="mt-auto flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                >
                    🚪 Cerrar Sesión
                </button>
            </aside>

            {/* Contenido Principal */}
            <main className="flex-1 p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-neutral-400 mt-1">Bienvenido de nuevo a tu panel de control.</p>
                </header>

                {/* Tarjetas de resumen (Ejemplo) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#16181d] p-6 rounded-2xl border border-neutral-800/60">
                        <h3 className="text-neutral-400 text-sm font-medium mb-2">Total Socios</h3>
                        <p className="text-4xl font-bold">124</p>
                    </div>
                    <div className="bg-[#16181d] p-6 rounded-2xl border border-neutral-800/60">
                        <h3 className="text-neutral-400 text-sm font-medium mb-2">Ingresos del Mes</h3>
                        <p className="text-4xl font-bold text-green-400">€3,450</p>
                    </div>
                    <div className="bg-[#16181d] p-6 rounded-2xl border border-red-900/30">
                        <h3 className="text-neutral-400 text-sm font-medium mb-2">Máquinas Mantenimiento</h3>
                        <p className="text-4xl font-bold text-red-500">2</p>
                    </div>
                </div>
            </main>

        </div>
    );
}