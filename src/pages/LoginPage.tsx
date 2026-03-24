import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../database/supabase/Client';
import { useAuthStore } from '../store/authStore';
import type { AuthError } from '@supabase/supabase-js';


// 1. Importamos nuestras piezas de "Lego" (Componentes Atómicos)
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';

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
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
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
                    <Input
                        label="Correo Electrónico"
                        type="email"
                        placeholder="ejemplo@fitbox.com"
                        error={errors.email?.message}
                        {...register("email", {
                            required: "El correo es obligatorio",
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Dirección de correo inválida"
                            }
                        })}
                    />

                    {/* Contraseña con validación */}
                    <Input
                        label="Contraseña"
                        type="password"
                        placeholder="••••••••"
                        error={errors.password?.message}
                        {...register("password", {
                            required: "La contraseña es obligatoria",
                            minLength: {
                                value: 6,
                                message: "La contraseña debe tener al menos 6 caracteres"
                            }
                        })}
                    />

                    {/* Botón Rojo (Cambiamos el texto si está cargando) */}
                    <div className="pt-4">
                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            disabled={isLoading}
                        >
                            {isLoading ? 'Comprobando credenciales...' : 'Entrar a FITBOX'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};