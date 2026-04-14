import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { AuthRepository, type RegisterData } from '../database/repositories/AuthRepository';
import type { AuthError } from '@supabase/supabase-js';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { REGEX, isValidDNI } from '../components/utils/regex';

// Tipamos todos los campos que el usuario va a rellenar
interface FormInputs extends RegisterData {
    confirmPassword?: string;
}

export const RegisterPage = () => {
    const navigate = useNavigate();
    const [authError, setAuthError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, watch, formState: { errors } } = useForm<FormInputs>();

    // Observamos la contraseña para comprobar que coincidan
    const password = watch('password');

    const onSubmit = async (data: FormInputs) => {
        setIsLoading(true);
        setAuthError(null);
        setSuccessMessage(null);

        try {
            const emailLimpio = data.email.trim().toLowerCase();
            const password = data.password as string;

            delete data.confirmPassword;

            // Añadimos automáticamente el Rol 3 (Socio)
            const datosConRolSeguro = {
                ...data,
                id_rol: 3
            };

            await AuthRepository.register(emailLimpio, password, datosConRolSeguro);

            setSuccessMessage('¡Registro completado! Preparando tu entorno...');

            setTimeout(() => {
                navigate('/');
            }, 3000);

        } catch (error) {
            const supError = error as AuthError;
            console.error("Error en registro:", supError);
            setAuthError(supError.message.includes('already registered')
                ? 'Este correo ya está registrado en FITBOX.'
                : 'Ocurrió un error al intentar crear la cuenta.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 py-12">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-extrabold text-white tracking-tight">
                    FIT<span className="text-fitbox-red">BOX</span>
                </h1>
                <p className="text-fitbox-text-muted mt-2">Únete a la revolución fitness</p>
            </div>

            <Card className="w-full max-w-3xl p-8">
                <h2 className="text-2xl font-bold mb-6 text-white text-center">
                    Formulario de Inscripción
                </h2>

                {authError && <Alert type="error" message={authError} />}
                {successMessage && <Alert type="success" message={successMessage} />}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {/* SECCIÓN 1: Datos Personales */}
                    <div>
                        <h3 className="text-fitbox-red font-semibold mb-4 border-b border-neutral-800 pb-2">Datos Personales</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-fitbox-text-muted">Nombre</label>
                                <Input placeholder="Ej. Alberto" {...register("nombre", { required: "Obligatorio" })} />
                                {errors.nombre && <span className="text-xs text-red-500">{errors.nombre.message}</span>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-fitbox-text-muted">Apellidos</label>
                                <Input placeholder="Ej. García" {...register("apellidos", { required: "Obligatorio" })} />
                                {errors.apellidos && <span className="text-xs text-red-500">{errors.apellidos.message}</span>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-fitbox-text-muted">DNI / NIE</label>
                                <Input
                                    placeholder="12345678X"
                                    {...register("dni", {
                                        required: "Obligatorio",
                                        validate: (value) => isValidDNI(value) || "DNI no válido o letra incorrecta"
                                    })}
                                />
                                {errors.dni && <span className="text-xs text-red-500">{errors.dni.message}</span>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-fitbox-text-muted">Sexo</label>
                                <select
                                    className={`w-full bg-[#1e2028] border border-neutral-800 rounded-lg px-4 py-2.5 text-fitbox-text focus:outline-none focus:ring-2 focus:ring-fitbox-red/50 ${errors.sexo ? 'border-fitbox-red' : ''}`}
                                    {...register("sexo", { required: "Selecciona una opción" })}
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Femenino">Femenino</option>
                                    <option value="Otro">Otro</option>
                                </select>
                                {errors.sexo && <span className="text-xs text-red-500">{errors.sexo.message}</span>}
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 2: Contacto y Dirección */}
                    <div>
                        <h3 className="text-fitbox-red font-semibold mb-4 border-b border-neutral-800 pb-2">Contacto y Localización</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-fitbox-text-muted">Teléfono</label>
                                <Input
                                    type="tel" placeholder="600 000 000"
                                    {...register("telefono", {
                                        required: "Obligatorio",
                                        pattern: { value: REGEX.TELEFONO, message: "Debe tener 9 dígitos válidos" }
                                    })}
                                />
                                {errors.telefono && <span className="text-xs text-red-500">{errors.telefono.message}</span>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-fitbox-text-muted">País</label>
                                <Input placeholder="Ej. España" {...register("pais", { required: "Obligatorio" })} />
                                {errors.pais && <span className="text-xs text-red-500">{errors.pais.message}</span>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-fitbox-text-muted">Provincia</label>
                                <Input placeholder="Ej. Madrid" {...register("provincia", { required: "Obligatorio" })} />
                                {errors.provincia && <span className="text-xs text-red-500">{errors.provincia.message}</span>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-fitbox-text-muted">Localidad</label>
                                <Input placeholder="Ej. Getafe" {...register("localidad", { required: "Obligatorio" })} />
                                {errors.localidad && <span className="text-xs text-red-500">{errors.localidad.message}</span>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-fitbox-text-muted">Código Postal</label>
                                <Input
                                    placeholder="28000"
                                    {...register("codigo_postal", {
                                        required: "Obligatorio",
                                        pattern: { value: REGEX.CODIGO_POSTAL, message: "Código postal inválido" }
                                    })}
                                />
                                {errors.codigo_postal && <span className="text-xs text-red-500">{errors.codigo_postal.message}</span>}
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 3: Credenciales de Acceso */}
                    <div>
                        <h3 className="text-fitbox-red font-semibold mb-4 border-b border-neutral-800 pb-2">Datos de Acceso</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div className="md:col-span-2 space-y-1">
                                <label className="text-sm font-medium text-fitbox-text-muted">Correo Electrónico</label>
                                <Input
                                    type="email" placeholder="ejemplo@gmail.com"
                                    {...register("email", {
                                        required: "Obligatorio",
                                        pattern: { value: REGEX.EMAIL_GMAIL, message: "Solo cuentas de @gmail.com" }
                                    })}
                                />
                                {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-fitbox-text-muted">Contraseña</label>
                                <Input
                                    type="password" placeholder="Mínimo 6 caracteres"
                                    {...register("password", {
                                        required: "Obligatorio",
                                        pattern: { value: REGEX.PASSWORD, message: "Mínimo 6 caracteres" }
                                    })}
                                />
                                {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-fitbox-text-muted">Confirmar Contraseña</label>
                                <Input
                                    type="password" placeholder="Repite la contraseña"
                                    {...register("confirmPassword", {
                                        required: "Obligatorio",
                                        validate: val => val === password || "Las contraseñas no coinciden"
                                    })}
                                />
                                {errors.confirmPassword && <span className="text-xs text-red-500">{errors.confirmPassword.message}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <Button type="submit" variant="default" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Creando ficha de socio...' : 'Completar Registro'}
                        </Button>
                    </div>
                </form>

                <div className="mt-6 text-center text-sm text-fitbox-text-muted">
                    ¿Ya eres socio?{' '}
                    <Link to="/" className="text-fitbox-red hover:text-fitbox-red-hover font-semibold transition-colors">
                        Inicia Sesión aquí
                    </Link>
                </div>
            </Card>
        </div>
    );
};