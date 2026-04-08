import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { AuthRepository, type RegisterData } from '../database/repositories/AuthRepository';
import type { AuthError } from '@supabase/supabase-js';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { REGEX, isValidDNI } from '../components/utils/regex'; // Asegúrate de que esta ruta sea correcta

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
            // .trim() quita los espacios fantasma de los lados
            // .toLowerCase() fuerza todo a minúsculas
            const emailLimpio = data.email.trim().toLowerCase();
            const password = data.password as string;

            // borramos la confirmación de la contraseña del paquete de datos
            delete data.confirmPassword;

            // Llamamos a tu repositorio pasándole nuestro emailLimpio 
            await AuthRepository.register(emailLimpio, password, data);

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

            {/* Hacemos el Card más ancho (max-w-2xl) para que quepan 2 columnas */}
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
                            <Input label="Nombre" placeholder="Ej. Alberto" error={errors.nombre?.message} {...register("nombre", { required: "Obligatorio" })} />
                            <Input label="Apellidos" placeholder="Ej. García" error={errors.apellidos?.message} {...register("apellidos", { required: "Obligatorio" })} />

                            {/* APLICAMOS VALIDACIÓN PERSONALIZADA AL DNI */}
                            <Input
                                label="DNI / NIE"
                                placeholder="12345678X"
                                error={errors.dni?.message}
                                {...register("dni", {
                                    required: "Obligatorio",
                                    validate: (value) => isValidDNI(value) || "DNI no válido o letra incorrecta"
                                })}
                            />

                            {/* Selector de Sexo adaptado al Dark UI */}
                            <div className="flex flex-col w-full gap-1 mb-4">
                                <label className="text-sm font-medium text-fitbox-text-muted">Sexo</label>
                                <select
                                    className={`bg-[#1e2028] border border-neutral-800 rounded-lg px-4 py-3 text-fitbox-text focus:outline-none focus:ring-2 focus:ring-fitbox-red/50 ${errors.sexo ? 'border-fitbox-red' : ''}`}
                                    {...register("sexo", { required: "Selecciona una opción" })}
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Femenino">Femenino</option>
                                    <option value="Otro">Otro</option>
                                </select>
                                {errors.sexo && <span className="text-xs font-medium text-fitbox-red mt-1">{errors.sexo.message}</span>}
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 2: Contacto y Dirección */}
                    <div>
                        <h3 className="text-fitbox-red font-semibold mb-4 border-b border-neutral-800 pb-2">Contacto y Localización</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* APLICAMOS REGEX AL TELÉFONO */}
                            <Input
                                label="Teléfono"
                                type="tel"
                                placeholder="600 000 000"
                                error={errors.telefono?.message}
                                {...register("telefono", {
                                    required: "Obligatorio",
                                    pattern: { value: REGEX.TELEFONO, message: "Debe tener 9 dígitos válidos" }
                                })}
                            />

                            <Input label="País" placeholder="Ej. España" error={errors.pais?.message} {...register("pais", { required: "Obligatorio" })} />
                            <Input label="Provincia" placeholder="Ej. Madrid" error={errors.provincia?.message} {...register("provincia", { required: "Obligatorio" })} />
                            <Input label="Localidad" placeholder="Ej. Getafe" error={errors.localidad?.message} {...register("localidad", { required: "Obligatorio" })} />

                            {/* APLICAMOS REGEX AL CÓDIGO POSTAL */}
                            <Input
                                label="Código Postal"
                                placeholder="28000"
                                error={errors.codigo_postal?.message}
                                {...register("codigo_postal", {
                                    required: "Obligatorio",
                                    pattern: { value: REGEX.CODIGO_POSTAL, message: "Código postal inválido en España" }
                                })}
                            />
                        </div>
                    </div>

                    {/* SECCIÓN 3: Credenciales de Acceso */}
                    <div>
                        <h3 className="text-fitbox-red font-semibold mb-4 border-b border-neutral-800 pb-2">Datos de Acceso</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                {/* APLICAMOS REGEX GMAIL AL CORREO */}
                                <Input
                                    label="Correo Electrónico"
                                    type="email"
                                    placeholder="ejemplo@gmail.com"
                                    error={errors.email?.message}
                                    {...register("email", {
                                        required: "Obligatorio",
                                        pattern: { value: REGEX.EMAIL_GMAIL, message: "Solo se permiten cuentas de @gmail.com" }
                                    })}
                                />
                            </div>

                            {/* APLICAMOS REGEX A LA CONTRASEÑA */}
                            <Input
                                label="Contraseña"
                                type="password"
                                placeholder="Mínimo 6 caracteres"
                                error={errors.password?.message}
                                {...register("password", {
                                    required: "Obligatorio",
                                    pattern: { value: REGEX.PASSWORD, message: "Mínimo 6 caracteres" }
                                })}
                            />

                            <Input
                                label="Confirmar Contraseña"
                                type="password"
                                placeholder="Repite la contraseña"
                                error={errors.confirmPassword?.message}
                                {...register("confirmPassword", {
                                    required: "Obligatorio",
                                    validate: val => val === password || "Las contraseñas no coinciden"
                                })}
                            />
                        </div>
                    </div>

                    <div className="pt-6">
                        <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
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