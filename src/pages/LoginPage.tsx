import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../database/supabase/Client';
import { useAuthStore } from '../store/authStore';
import type { AuthError } from '@supabase/supabase-js';

import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { REGEX } from '../components/utils/regex';
import { Dumbbell, Flame, Users, CalendarCheck, X } from 'lucide-react';
import { RegisterPage } from './RegisterPage';

interface LoginFormInputs {
    email: string;
    password: string;
}

export const LoginPage = () => {
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);

    const [authError, setAuthError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormInputs>();

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
        } catch (error) {
            const authError = error as AuthError;
            console.error("Error en login:", authError);

            setAuthError(authError.message === 'Invalid login credentials'
                ? 'Correo o contraseña incorrectos. Inténtalo de nuevo.'
                : 'Ocurrió un error al intentar iniciar sesión.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full relative flex items-center justify-center bg-neutral-950 overflow-hidden">

            {/* FONDOS Y EFECTOS */}
            <div className="absolute inset-0 bg-linear-to-br from-neutral-950 via-red-900/10 to-neutral-950 z-0 pointer-events-none"></div>
            <div className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>

            <div className="relative z-10 w-full max-w-5xl p-8 flex flex-col items-center text-center space-y-12">

                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h2 className="text-fitbox-red font-black tracking-widest uppercase text-lg">Bienvenido a</h2>
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white uppercase italic tracking-tighter leading-none">
                        FIT<span className="text-fitbox-red">BOX</span>
                    </h1>
                    <p className="text-xl md:text-3xl text-gray-400 font-bold uppercase italic tracking-wide mt-4">
                        Gestión y Acceso Inteligente.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="flex flex-col items-center gap-3 p-4">
                        <div className="bg-fitbox-red/10 p-4 rounded-2xl border border-fitbox-red/20 text-fitbox-red"><Dumbbell className="w-8 h-8" /></div>
                        <h3 className="text-white font-black uppercase tracking-widest text-xs md:text-sm">Premium</h3>
                    </div>
                    <div className="flex flex-col items-center gap-3 p-4">
                        <div className="bg-fitbox-red/10 p-4 rounded-2xl border border-fitbox-red/20 text-fitbox-red"><Flame className="w-8 h-8" /></div>
                        <h3 className="text-white font-black uppercase tracking-widest text-xs md:text-sm">Intensidad</h3>
                    </div>
                    <div className="flex flex-col items-center gap-3 p-4">
                        <div className="bg-fitbox-red/10 p-4 rounded-2xl border border-fitbox-red/20 text-fitbox-red"><Users className="w-8 h-8" /></div>
                        <h3 className="text-white font-black uppercase tracking-widest text-xs md:text-sm">Comunidad</h3>
                    </div>
                    <div className="flex flex-col items-center gap-3 p-4">
                        <div className="bg-fitbox-red/10 p-4 rounded-2xl border border-fitbox-red/20 text-fitbox-red"><CalendarCheck className="w-8 h-8" /></div>
                        <h3 className="text-white font-black uppercase tracking-widest text-xs md:text-sm">Gestión</h3>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md pt-8 animate-in zoom-in duration-500 delay-300">
                    <Button
                        onClick={() => setShowLoginModal(true)}
                        className="flex-1 bg-white hover:bg-gray-200 text-black h-16 font-black uppercase italic tracking-widest text-lg shadow-xl"
                    >
                        Iniciar Sesión
                    </Button>
                    <Button
                        onClick={() => setShowRegisterModal(true)}
                        className="flex-1 bg-fitbox-red hover:bg-red-700 text-white h-16 font-black uppercase italic tracking-widest text-lg shadow-xl shadow-fitbox-red/20"
                    >
                        Crea una cuenta
                    </Button>
                </div>
            </div>

            {/* --- MODAL DE LOGIN CON EFECTO CRISTAL --- */}
            {showLoginModal && (
                <div className="fixed inset-0 z-100 bg-black/40 backdrop-blur-md overflow-y-auto p-4 sm:p-6 animate-in fade-in duration-300">
                    <div className="flex min-h-full items-center justify-center">
                        <Card className="w-full max-w-md p-8 bg-neutral-950/90 border-neutral-800 shadow-2xl relative animate-in zoom-in-95">

                            <button
                                onClick={() => { setShowLoginModal(false); setAuthError(null); }}
                                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <h2 className="text-2xl font-bold mb-6 text-white text-center">
                                Iniciar Sesión
                            </h2>

                            {authError && <Alert type="error" message={authError} />}

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium leading-none text-white">
                                        Correo Electrónico
                                    </label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="ejemplo@fitbox.com"
                                        className="bg-neutral-900 border-neutral-800 text-white"
                                        {...register("email", {
                                            required: "El correo es obligatorio",
                                            pattern: {
                                                value: REGEX.EMAIL_GENERAL,
                                                message: "Dirección de correo inválida"
                                            },
                                            onChange: (e) => {
                                                setValue("email", e.target.value.replace(/\s/g, ''), { shouldValidate: true });
                                            }
                                        })}
                                    />
                                    {errors.email?.message && (
                                        <p className="text-sm font-medium text-red-500">
                                            {errors.email.message as string}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="password" className="text-sm font-medium leading-none text-white">
                                        Contraseña
                                    </label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="bg-neutral-900 border-neutral-800 text-white"
                                        {...register("password", {
                                            required: "La contraseña es obligatoria",
                                            minLength: {
                                                value: 6,
                                                message: "La contraseña debe tener al menos 6 caracteres"
                                            }
                                        })}
                                    />
                                    {errors.password?.message && (
                                        <p className="text-sm font-medium text-red-500">
                                            {errors.password.message as string}
                                        </p>
                                    )}
                                </div>

                                <div className="pt-4">
                                    <Button type="submit" variant="default" className="w-full bg-fitbox-red hover:bg-red-700 text-white font-bold py-6 text-lg shadow-lg" disabled={isLoading}>
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