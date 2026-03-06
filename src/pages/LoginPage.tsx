import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- Añade esto
import { supabase } from '../database/supabase/Client';
import FitboxLogo from '../assets/Fitbox.png';


export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Llamada real de autenticación a Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError('Credenciales incorrectas. Verifica tu email y contraseña.');
        } else {
            console.log('Usuario logueado:', data);
            navigate('/dashboard');
        }

        setLoading(false);
    };

    return (
        // Fondo general oscuro como en el dashboard
        <div className="min-h-screen bg-[#0f1115] flex flex-col items-center justify-center p-4 font-sans text-neutral-200">

            {/* Contenedor principal de la tarjeta */}
            <div className="w-full max-w-md bg-[#16181d] rounded-2xl shadow-2xl border border-neutral-800/60 overflow-hidden">

                <div className="p-8 sm:p-10">

                    {/* Logo y Cabecera */}
                    <div className="flex flex-col items-center mb-8">
                        <img src={FitboxLogo} alt="FITBOX Logo" className="h-24 w-auto mb-4 drop-shadow-lg" />
                        <h1 className="text-2xl font-bold text-white tracking-wide">Iniciar Sesión</h1>
                        <p className="text-sm text-neutral-400 mt-2 text-center">
                            Accede a la plataforma de gestión de gimnasios
                        </p>
                    </div>

                    {/* Mensaje de Error */}
                    {error && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    {/* Formulario */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#0f1115] border border-neutral-700/50 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all duration-200"
                                placeholder="socio@fitbox.com"
                                required
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-sm font-medium text-neutral-300">
                                    Contraseña
                                </label>
                                <a href="#" className="text-xs text-red-500 hover:text-red-400 transition-colors">
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#0f1115] border border-neutral-700/50 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all duration-200"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_20px_rgba(220,38,38,0.5)]"
                        >
                            {loading ? 'Verificando...' : 'Entrar a FITBOX'}
                        </button>
                    </form>

                </div>
            </div>

            {/* Footer del login */}
            <p className="mt-8 text-xs text-neutral-500">
                &copy; {new Date().getFullYear()} FITBOX. Desarrollado por Alberto García.
            </p>

        </div>
    );
}