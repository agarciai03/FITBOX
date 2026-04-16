import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { AuthRepository, type RegisterData } from '../database/repositories/AuthRepository';
import { supabase } from '../database/supabase/Client';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';
import { REGEX, isValidDNI, calcularLetraDNI } from '../components/utils/regex';

interface FormInputs extends RegisterData {
    confirmPassword?: string;
}

export const RegisterPage = () => {
    const navigate = useNavigate();
    const [authError, setAuthError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormInputs>();
    const password = watch('password');

    const handleAvatarSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data: FormInputs) => {
        setIsLoading(true);
        setAuthError(null);
        setSuccessMessage(null);

        try {
            const emailLimpio = data.email.trim().toLowerCase();
            const password = data.password as string;

            delete data.confirmPassword;

            const datosLimpios = {
                ...data,
                nombre: data.nombre.trim(),
                apellidos: data.apellidos.trim(),
                dni: data.dni.trim().toUpperCase(),
                telefono: data.telefono.trim(),
                fecha_nacimiento: data.fecha_nacimiento,
                id_rol: 3,
                avatar_url: null
            };

            const authResponse = await AuthRepository.register(emailLimpio, password, datosLimpios);
            const userId = authResponse.user?.id;

            if (avatarFile && userId) {
                const fileExt = avatarFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${userId}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, avatarFile);

                if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('avatars')
                        .getPublicUrl(filePath);
                    await supabase.from('usuarios').update({ avatar_url: publicUrl }).eq('id_usuario', userId);
                }
            }

            setSuccessMessage('¡Registro completado con éxito! Preparando tu entorno...');

            setTimeout(() => {
                navigate('/');
            }, 3000);

        } catch (error: any) {
            console.error("Error en registro:", error);

            // FILTRO DE ERRORES: DNI o Correo Duplicados
            if (error.status === 400 || error.message?.includes('already registered')) {
                setAuthError('Este correo electrónico ya está registrado en FITBOX.');
            }
            // Cuando el Trigger choca contra la restricción UNIQUE del DNI, Supabase devuelve este error 500
            else if (error.code === '23505' || error.message?.includes('Database error saving new user')) {
                setAuthError('El DNI o el correo introducido ya pertenecen a un usuario registrado.');
            }
            else {
                setAuthError('Ocurrió un error inesperado al intentar crear la cuenta.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 py-12 animate-in fade-in duration-500">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-extrabold text-white tracking-tight">
                    FIT<span className="text-fitbox-red">BOX</span>
                </h1>
                <p className="text-fitbox-text-muted mt-2">Únete a la revolución fitness</p>
            </div>

            <Card className="w-full max-w-3xl p-8 shadow-2xl bg-fitbox-card border-neutral-800">
                <h2 className="text-2xl font-bold mb-6 text-white text-center">
                    Formulario de Inscripción
                </h2>

                {authError && <Alert type="error" message={authError} />}
                {successMessage && <Alert type="success" message={successMessage} />}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                    {/* SELECTOR DE AVATAR */}
                    <div className="flex flex-col items-center justify-center mb-8">
                        <label className="cursor-pointer relative group block">
                            <Avatar className="h-24 w-24 border-2 border-dashed border-neutral-700 group-hover:border-fitbox-red transition-colors shadow-lg">
                                {avatarPreview ? (
                                    <AvatarImage src={avatarPreview} className="object-cover" />
                                ) : (
                                    <AvatarFallback className="bg-neutral-900 text-neutral-500 flex flex-col items-center justify-center">
                                        <Camera className="w-8 h-8 mb-1" />
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                <span className="text-xs font-bold text-white">Subir Foto</span>
                            </div>
                            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarSelection} />
                        </label>
                        <p className="text-xs text-gray-500 mt-3 uppercase tracking-wider font-bold">Foto de Perfil (Opcional)</p>
                    </div>

                    {/* SECCIÓN 1: Datos Personales */}
                    <div>
                        <h3 className="text-fitbox-red font-semibold mb-4 border-b border-neutral-800 pb-2">Datos Personales</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Nombre</label>
                                <Input
                                    placeholder="Ej. Alberto"
                                    className={`bg-neutral-900 border-neutral-800 ${errors.nombre ? 'border-red-500' : 'focus:border-fitbox-red'}`}
                                    {...register("nombre", {
                                        required: "El nombre es obligatorio",
                                        pattern: { value: REGEX.TEXTO_PURO, message: "Solo letras y espacios (mín. 2)" }
                                    })}
                                />
                                {errors.nombre && <span className="text-xs text-red-500 font-medium">{errors.nombre.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Apellidos</label>
                                <Input
                                    placeholder="Ej. García"
                                    className={`bg-neutral-900 border-neutral-800 ${errors.apellidos ? 'border-red-500' : 'focus:border-fitbox-red'}`}
                                    {...register("apellidos", {
                                        required: "Los apellidos son obligatorios",
                                        pattern: { value: REGEX.TEXTO_PURO, message: "Solo letras y espacios" }
                                    })}
                                />
                                {errors.apellidos && <span className="text-xs text-red-500 font-medium">{errors.apellidos.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">DNI / NIE</label>
                                <Input
                                    placeholder="12345678X"
                                    className={`bg-neutral-900 border-neutral-800 uppercase ${errors.dni ? 'border-red-500' : 'focus:border-fitbox-red'}`}
                                    {...register("dni", {
                                        required: "El documento es obligatorio",
                                        validate: (value) => {
                                            const valLimpio = value.toUpperCase();
                                            return isValidDNI(valLimpio) || REGEX.NIE.test(valLimpio) || "Formato inválido o letra incorrecta";
                                        }
                                    })}
                                    onChange={(e) => {
                                        let valor = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                                        if (/^\d{8}$/.test(valor)) {
                                            valor = valor + calcularLetraDNI(valor);
                                        }
                                        valor = valor.slice(0, 9);
                                        setValue("dni", valor, { shouldValidate: true });
                                    }}
                                />
                                {errors.dni && <span className="text-xs text-red-500 font-medium">{errors.dni.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Fecha de Nacimiento</label>
                                <Input
                                    type="date"
                                    className={`bg-neutral-900 border-neutral-800 text-white ${errors.fecha_nacimiento ? 'border-red-500' : 'focus:border-fitbox-red'}`}
                                    {...register("fecha_nacimiento", {
                                        required: "La fecha es obligatoria",
                                        validate: (value) => {
                                            const hoy = new Date();
                                            const fechaNac = new Date(value);
                                            let edad = hoy.getFullYear() - fechaNac.getFullYear();
                                            const mes = hoy.getMonth() - fechaNac.getMonth();
                                            if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
                                                edad--;
                                            }
                                            return edad >= 16 || "Debes tener al menos 16 años para registrarte en el gimnasio.";
                                        }
                                    })}
                                />
                                {errors.fecha_nacimiento && <span className="text-xs text-red-500 font-medium">{errors.fecha_nacimiento.message}</span>}
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Sexo</label>
                                <select
                                    className={`w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-fitbox-red transition-all ${errors.sexo ? 'border-red-500' : ''}`}
                                    {...register("sexo", { required: "Selecciona una opción" })}
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="Hombre">Hombre</option>
                                    <option value="Mujer">Mujer</option>
                                    <option value="Otro">Otro</option>
                                </select>
                                {errors.sexo && <span className="text-xs text-red-500 font-medium">{errors.sexo.message}</span>}
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 2: Contacto y Dirección */}
                    <div>
                        <h3 className="text-fitbox-red font-semibold mb-4 border-b border-neutral-800 pb-2">Contacto y Localización</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Teléfono de Contacto</label>
                                <Input
                                    type="tel"
                                    placeholder="600 000 000"
                                    className={`bg-neutral-900 border-neutral-800 ${errors.telefono ? 'border-red-500' : 'focus:border-fitbox-red'}`}
                                    {...register("telefono", {
                                        required: "El teléfono es obligatorio",
                                        pattern: { value: REGEX.TELEFONO, message: "Debe tener 9 dígitos numéricos" }
                                    })}
                                    onChange={(e) => {
                                        const valorLimpio = e.target.value.replace(/\D/g, '').slice(0, 9);
                                        setValue("telefono", valorLimpio, { shouldValidate: true });
                                    }}
                                />
                                {errors.telefono && <span className="text-xs text-red-500 font-medium">{errors.telefono.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">País</label>
                                <Input
                                    placeholder="Ej. España"
                                    className={`bg-neutral-900 border-neutral-800 ${errors.pais ? 'border-red-500' : 'focus:border-fitbox-red'}`}
                                    {...register("pais", { required: "Obligatorio" })}
                                />
                                {errors.pais && <span className="text-xs text-red-500 font-medium">{errors.pais.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Provincia</label>
                                <Input
                                    placeholder="Ej. Madrid"
                                    className={`bg-neutral-900 border-neutral-800 ${errors.provincia ? 'border-red-500' : 'focus:border-fitbox-red'}`}
                                    {...register("provincia", { required: "Obligatorio" })}
                                />
                                {errors.provincia && <span className="text-xs text-red-500 font-medium">{errors.provincia.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Localidad / Ciudad</label>
                                <Input
                                    placeholder="Ej. Getafe"
                                    className={`bg-neutral-900 border-neutral-800 ${errors.localidad ? 'border-red-500' : 'focus:border-fitbox-red'}`}
                                    {...register("localidad", { required: "Obligatorio" })}
                                />
                                {errors.localidad && <span className="text-xs text-red-500 font-medium">{errors.localidad.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Código Postal</label>
                                <Input
                                    placeholder="28000"
                                    className={`bg-neutral-900 border-neutral-800 ${errors.codigo_postal ? 'border-red-500' : 'focus:border-fitbox-red'}`}
                                    {...register("codigo_postal", {
                                        required: "Obligatorio",
                                        pattern: { value: REGEX.CODIGO_POSTAL, message: "Código postal español inválido (5 cifras numéricas)" }
                                    })}
                                    onChange={(e) => {
                                        const valorLimpio = e.target.value.replace(/\D/g, '').slice(0, 5);
                                        setValue("codigo_postal", valorLimpio, { shouldValidate: true });
                                    }}
                                />
                                {errors.codigo_postal && <span className="text-xs text-red-500 font-medium">{errors.codigo_postal.message}</span>}
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 3: Credenciales de Acceso */}
                    <div>
                        <h3 className="text-fitbox-red font-semibold mb-4 border-b border-neutral-800 pb-2">Datos de Acceso</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Correo Electrónico</label>
                                <Input
                                    type="email"
                                    placeholder="ejemplo@correo.com"
                                    className={`bg-neutral-900 border-neutral-800 ${errors.email ? 'border-red-500' : 'focus:border-fitbox-red'}`}
                                    {...register("email", {
                                        required: "El correo es obligatorio",
                                        pattern: { value: REGEX.EMAIL_GENERAL, message: "Formato de correo inválido" }
                                    })}
                                />
                                {errors.email && <span className="text-xs text-red-500 font-medium">{errors.email.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Contraseña</label>
                                <Input
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    className={`bg-neutral-900 border-neutral-800 ${errors.password ? 'border-red-500' : 'focus:border-fitbox-red'}`}
                                    {...register("password", {
                                        required: "La contraseña es obligatoria",
                                        pattern: { value: REGEX.PASSWORD, message: "Mínimo 6 caracteres" }
                                    })}
                                />
                                {errors.password && <span className="text-xs text-red-500 font-medium">{errors.password.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Confirmar Contraseña</label>
                                <Input
                                    type="password"
                                    placeholder="Repite la contraseña"
                                    className={`bg-neutral-900 border-neutral-800 ${errors.confirmPassword ? 'border-red-500' : 'focus:border-fitbox-red'}`}
                                    {...register("confirmPassword", {
                                        required: "Debes confirmar la contraseña",
                                        validate: val => val === password || "Las contraseñas no coinciden"
                                    })}
                                />
                                {errors.confirmPassword && <span className="text-xs text-red-500 font-medium">{errors.confirmPassword.message}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <Button type="submit" className="w-full bg-fitbox-red hover:bg-red-700 text-white font-bold py-6 text-lg shadow-lg" disabled={isLoading}>
                            {isLoading ? 'Creando ficha de socio...' : 'Completar Registro'}
                        </Button>
                    </div>
                </form>

                <div className="mt-8 text-center text-sm text-fitbox-text-muted">
                    ¿Ya eres socio?{' '}
                    <Link to="/" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
                        Inicia Sesión aquí
                    </Link>
                </div>
            </Card>
        </div>
    );
};