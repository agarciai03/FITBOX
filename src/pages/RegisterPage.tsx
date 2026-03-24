import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom'; // Importamos nuestro Repositorio
import type { AuthError } from '@supabase/supabase-js';

// Componentes "Lego"
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { AuthRepository } from '../database/repositories/AuthRepository';

interface RegisterFormInputs {
    nombre: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export const RegistroPage = () => {
    const navigate = useNavigate();
    const [authError, setAuthError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormInputs>();

    // Observamos la contraseña para comprobar que coinciden
    const password = watch('password');

    const onSubmit = async (data: RegisterFormInputs) => {
        setIsLoading(true);
        setAuthError(null);
        setSuccessMessage(null);

        try {
            // Usamos la capa del Repositorio en lugar de llamar a Supabase directamente
            await AuthRepository.register(data.email, data.password, data.nombre);

            // Si todo va bien, mostramos mensaje de éxito y redirigimos
            setSuccessMessage('¡Registro completado! Tu código QR se ha generado. Redirigiendo al Login...');

            setTimeout(() => {
                navigate('/'); // Lo mandamos al Login después de 3 segundos
            }, 3000);

        } catch (error) {
            const supError = error as AuthError;
            console.error("Error en registro:", supError);
            setAuthError(supError.message === 'User already registered'
                ? 'Este correo ya está registrado en FITBOX.'
                : 'Ocurrió un error al intentar crear la cuenta.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-extrabold text-white tracking-tight">
                    FIT<span className="text-fitbox-red">BOX</span>
                </h1>
                <p className="text-fitbox-text-muted mt-2">Únete a la revolución fitness</p>
            </div>

            <Card className="w-full max-w-md p-8">
                <h2 className="text-2xl font-bold mb-6 text-white text-center">
                    Crear Cuenta
                </h2>

                {authError && <Alert type="error" message={authError} />}
                {successMessage && <Alert type="success" message={successMessage} />}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    <Input
                        label="Nombre Completo"
                        type="text"
                        placeholder="Ej. Alberto García"
                        error={errors.nombre?.message}
                        {...register("nombre", { required: "El nombre es obligatorio" })}
                    />

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

                    <Input
                        label="Contraseña"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        error={errors.password?.message}
                        {...register("password", {
                            required: "La contraseña es obligatoria",
                            minLength: {
                                value: 6,
                                message: "La contraseña debe tener al menos 6 caracteres"
                            }
                        })}
                    />

                    <Input
                        label="Confirmar Contraseña"
                        type="password"
                        placeholder="Repite tu contraseña"
                        error={errors.confirmPassword?.message}
                        {...register("confirmPassword", {
                            required: "Debes confirmar tu contraseña",
                            validate: value => value === password || "Las contraseñas no coinciden"
                        })}
                    />

                    <div className="pt-4">
                        <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
                            {isLoading ? 'Creando cuenta...' : 'Registrarme'}
                        </Button>
                    </div>
                </form>

                <div className="mt-6 text-center text-sm text-fitbox-text-muted">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/" className="text-fitbox-red hover:text-fitbox-red-hover font-semibold transition-colors">
                        Inicia Sesión aquí
                    </Link>
                </div>
            </Card>
        </div>
    );
};