import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../database/supabase/Client';
import { useAuthStore } from '../store/authStore';
import type { AuthError } from '@supabase/supabase-js';

// 1. Importamos nuestras piezas de "Lego" (Componentes Atómicos)
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { REGEX } from '../components/utils/regex';

// 2. Tipamos los datos del formulario (Teoría: Interfaces y Tipos)
interface LoginFormInputs {
    email: string;
    password: string;
}

export const LoginPage = () => {
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);

    // Estado local solo para mostrar errores de Supabase (contraseña incorrecta, etc.)
    const [authError, setAuthError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // 3. Inicializamos React Hook Form (Rendimiento optimizado sin re-renders)
    const {
        register,
        handleSubmit,
        setValue, // Importamos setValue para poder inyectar datos limpios al estado de React Hook Form
        formState: { errors }
    } = useForm<LoginFormInputs>();

    // 4. Lógica de envío a Supabase
    const onSubmit = async (data: LoginFormInputs) => {
        setIsLoading(true);
        setAuthError(null);

        try {
            const { data: authData, error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (error) throw error;

            // Si todo va bien, guardamos el usuario en Zustand y lo mandamos al Dashboard
            if (authData.user) {
                await setUser(authData.user);
                navigate('/dashboard');
            }
        } catch (error) {
            // Le decimos a TypeScript que trate este error con el formato oficial de Supabase
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
        <div className="flex-1 flex flex-col items-center justify-center p-4 w-full py-12 md:py-24">

            {/* 5. El logo del gimnasio */}
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-extrabold text-white tracking-tight">
                    FIT<span className="text-fitbox-red">BOX</span>
                </h1>
                <p className="text-fitbox-text-muted mt-2">Gestión y Acceso Inteligente</p>
            </div>

            {/* 6. Ensamblamos el Card y el Formulario */}
            <Card className="w-full max-w-md p-8">
                <h2 className="text-2xl font-bold mb-6 text-white text-center">
                    Iniciar Sesión
                </h2>

                {/* Si hay error de Supabase, pintamos nuestro componente Alert */}
                {authError && <Alert type="error" message={authError} />}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* Email con validación de React Hook Form */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium leading-none text-white">
                            Correo Electrónico
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="ejemplo@fitbox.com"
                            {...register("email", {
                                required: "El correo es obligatorio",
                                pattern: {
                                    value: REGEX.EMAIL_GENERAL,
                                    message: "Dirección de correo inválida"
                                },
                                // Bloqueamos los espacios en blanco en vivo
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

                    {/* Contraseña con validación */}
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium leading-none text-white">
                            Contraseña
                        </label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
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

                    {/* Botón Rojo (Cambiamos el texto a "Acceder") */}
                    <div className="pt-4">
                        <Button type="submit" variant="default" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Comprobando credenciales...' : 'Acceder'}
                        </Button>
                    </div>
                </form>

                {/* Enlace directo al Registro */}
                <div className="mt-6 text-center text-sm text-fitbox-text-muted">
                    ¿No tienes cuenta?{' '}
                    <Link
                        to="/registro"
                        className="text-fitbox-red font-semibold hover:text-white transition-colors"
                    >
                        Crea una ahora
                    </Link>
                </div>

            </Card>
        </div>
    );
};