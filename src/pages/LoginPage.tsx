import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../database/supabase/Client';
import { useAuthStore } from '../store/authStore';

import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { REGEX } from '../utils/regex';
import { Dumbbell, Flame, Users, CalendarCheck, X, CheckCircle, Mail } from 'lucide-react';
import { RegisterPage } from './RegisterPage';
import { AuthRepository } from '../database/repositories/AuthRepository';

interface LoginFormInputs {
    email: string;
    password: string;
}

export const LoginPage = () => {
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);

    // Estados para la recuperación de contraseña
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);

    const [authError, setAuthError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit } = useForm<LoginFormInputs>();

    const onSubmit = async (data: LoginFormInputs) => {
        setIsLoading(true);
        setAuthError(null);

        try {
            const { data: authData, error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (error) throw error;

            if (authData.user) {
                await setUser(authData.user);
                navigate('/dashboard');
            }
        } catch (error: any) {
            if (error.message?.includes('Invalid login credentials')) {
                setAuthError("Correo electrónico o contraseña incorrectos.");
            } else {
                setAuthError("Error al iniciar sesión. Inténtalo de nuevo.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetLoading(true);
        setAuthError(null);
        try {
            await AuthRepository.sendResetPasswordEmail(resetEmail);
            setResetSuccess(true);
        } catch {
            setAuthError("No se pudo enviar el correo de recuperación. Verifica el email.");
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 flex flex-col relative overflow-hidden">
            {/* Fondo decorativo */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#450a0a,transparent)] opacity-40 pointer-events-none"></div>

            {/* Contenido Landing */}
            <main className="relative z-10 grow flex flex-col items-center justify-center px-4 pt-20 pb-32">
                <div className="text-center space-y-6 max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/30 border border-red-900/50 rounded-full text-fitbox-red text-xs font-bold uppercase tracking-widest animate-fade-in">
                        <Flame className="w-3 h-3" />
                        Tu mejor versión empieza aquí
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black text-white italic uppercase tracking-tighter leading-none animate-slide-up">
                        FIT<span className="text-fitbox-red text-shadow-red">BOX</span>
                    </h1>

                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
                        Entrenamiento de élite, tecnología de vanguardia y una comunidad imparable. Únete al club más exclusivo.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                        <Button
                            onClick={() => setShowRegisterModal(true)}
                            className="bg-fitbox-red hover:bg-red-700 text-white font-black px-10 py-7 text-xl rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all hover:scale-105"
                        >
                            EMPEZAR AHORA
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowLoginModal(true)}
                            className="bg-transparent border-neutral-800 text-white hover:bg-neutral-900 px-10 py-7 text-xl rounded-2xl font-bold"
                        >
                            ACCESO SOCIOS
                        </Button>
                    </div>
                </div>

                {/* Grid de características */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-32 w-full max-w-6xl">
                    {[
                        { icon: Dumbbell, label: "Equipamiento Pro", val: "Premium" },
                        { icon: Users, label: "Comunidad", val: "+500" },
                        { icon: CalendarCheck, label: "Clases Diarias", val: "24h" },
                        { icon: Flame, label: "Intensidad", val: "100%" }
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 p-6 rounded-3xl bg-neutral-900/40 border border-neutral-800/50 backdrop-blur-sm">
                            <item.icon className="w-8 h-8 text-fitbox-red mb-2" />
                            <span className="text-white font-black uppercase text-xl italic">{item.val}</span>
                            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">{item.label}</span>
                        </div>
                    ))}
                </div>
            </main>

            {/* --- MODAL DE LOGIN --- */}
            {showLoginModal && (
                <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-md relative">
                        <Card className="p-8 shadow-2xl bg-neutral-950/90 border-neutral-800 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-fitbox-red via-red-600 to-red-900"></div>

                            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>

                            <div className="mb-8 text-center">
                                <h1 className="text-4xl font-extrabold text-white tracking-tight italic uppercase">
                                    FIT<span className="text-fitbox-red">BOX</span>
                                </h1>
                                <p className="text-fitbox-text-muted mt-2">Acceso área privada</p>
                            </div>

                            {authError && <Alert type="error" message={authError} />}

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email Corporativo</label>
                                    <Input
                                        type="email"
                                        placeholder="socio@fitbox.com"
                                        className="bg-neutral-900 border-neutral-800 text-white h-12 focus:border-fitbox-red transition-all"
                                        {...register("email", { required: true, pattern: REGEX.EMAIL_GENERAL })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Contraseña</label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="bg-neutral-900 border-neutral-800 text-white h-12 focus:border-fitbox-red transition-all"
                                        {...register("password", { required: true })}
                                    />
                                </div>

                                {/* ENLACE RECUPERACIÓN */}
                                <div className="text-right">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowLoginModal(false);
                                            setShowResetModal(true);
                                        }}
                                        className="text-[10px] text-gray-500 hover:text-fitbox-red transition-colors font-bold uppercase tracking-widest"
                                    >
                                        ¿Has olvidado tu contraseña?
                                    </button>
                                </div>

                                <div className="pt-2">
                                    <Button type="submit" className="w-full bg-fitbox-red hover:bg-red-700 text-white font-bold py-6 text-lg shadow-lg" disabled={isLoading}>
                                        {isLoading ? 'Comprobando credenciales...' : 'Acceder'}
                                    </Button>
                                </div>
                            </form>

                            <div className="mt-6 text-center text-sm text-fitbox-text-muted">
                                ¿No tienes cuenta?{' '}
                                <button
                                    onClick={() => {
                                        setShowLoginModal(false);
                                        setShowRegisterModal(true);
                                    }}
                                    className="text-fitbox-red font-semibold hover:text-white transition-colors"
                                >
                                    Crea una ahora
                                </button>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* --- NUEVO MODAL DE RECUPERACIÓN --- */}
            {showResetModal && (
                <div className="fixed inset-0 z-110 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                    <Card className="w-full max-w-md p-8 bg-neutral-950/90 border-neutral-800 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-fitbox-red"></div>
                        <button onClick={() => { setShowResetModal(false); setResetSuccess(false); }} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-900/50">
                                <Mail className="text-fitbox-red w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Recuperar <span className="text-fitbox-red">Acceso</span></h2>
                        </div>

                        {resetSuccess ? (
                            <div className="text-center py-4 space-y-6 animate-in zoom-in">
                                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                                    <p className="text-sm text-gray-300 font-medium">Revisa tu bandeja de entrada. Te hemos enviado un enlace seguro para cambiar tu contraseña.</p>
                                </div>
                                <Button onClick={() => setShowResetModal(false)} className="w-full bg-neutral-800 font-bold">Cerrar ventana</Button>
                            </div>
                        ) : (
                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <p className="text-sm text-gray-400 text-center">Introduce el email de tu cuenta y te enviaremos las instrucciones de restablecimiento.</p>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email de Registro</label>
                                    <Input
                                        type="email"
                                        placeholder="tu@email.com"
                                        required
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        className="bg-neutral-900 border-neutral-800 h-12 text-white"
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-fitbox-red py-6 font-bold shadow-lg" disabled={resetLoading}>
                                    {resetLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                                </Button>
                            </form>
                        )}
                    </Card>
                </div>
            )}

            {/* --- MODAL DE REGISTRO --- */}
            {showRegisterModal && (
                <RegisterPage
                    onClose={() => setShowRegisterModal(false)}
                    onShowLogin={() => {
                        setShowRegisterModal(false);
                        setShowLoginModal(true);
                    }}
                />
            )}

        </div>
    );
};