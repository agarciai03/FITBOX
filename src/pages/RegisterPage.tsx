import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { AuthRepository, type RegisterData } from '../database/repositories/AuthRepository';
import { supabase } from '../database/supabase/Client';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, X } from 'lucide-react';
import { REGEX, isValidDNI, limpiarDNI } from '../utils/regex';
import { PolicyModal } from '../components/ui/PoliticasModal';

interface FormInputs extends RegisterData {
    confirmPassword?: string;
    aceptarTerminos?: boolean;
}

export const RegisterPage = ({ onClose, onShowLogin }: { onClose?: () => void; onShowLogin?: () => void }) => {
    const navigate = useNavigate();
    const [authError, setAuthError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [policyModalOpen, setPolicyModalOpen] = useState(false);

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormInputs>();
    const watchPassword = watch('password');
    const watchAceptarTerminos = watch('aceptarTerminos');

    const handleAvatarSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setAuthError("Formato no válido. Solo se permiten imágenes (JPG, JPEG, PNG, WEBP).");
            return;
        }

        const maxSizeInBytes = 5 * 1024 * 1024; 
        if (file.size > maxSizeInBytes) {
            setAuthError("La imagen es demasiado pesada. El tamaño máximo es 5MB.");
            return;
        }

        setAuthError(null);
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const onSubmit = async (data: FormInputs) => {
        setIsLoading(true);
        setAuthError(null);
        setSuccessMessage(null);

        try {
            const { password, ...restData } = data;
            const emailLimpio = restData.email.trim().toLowerCase();

            if (!REGEX.EMAIL_GENERAL.test(emailLimpio)) {
                setAuthError("El formato del correo electrónico no es válido.");
                setIsLoading(false);
                return;
            }

            let finalAvatarUrl = null;

            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `nuevos-socios/${fileName}`;

                const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, avatarFile, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: avatarFile.type
                });

                if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
                    finalAvatarUrl = publicUrl; 
                } else {
                    console.error("No se pudo subir la imagen al Storage:", uploadError);
                }
            }

            const datosLimpios = {
                ...restData,
                email: emailLimpio,
                nombre: restData.nombre.trim(),
                apellidos: restData.apellidos.trim(),
                dni: restData.dni.trim().toUpperCase(),
                telefono: restData.telefono.trim(),
                fecha_nacimiento: restData.fecha_nacimiento,
                pais: restData.pais.trim(),
                provincia: restData.provincia.trim(),
                localidad: restData.localidad.trim(),
                id_rol: 3,
                avatar_url: finalAvatarUrl 
            };

            const authResponse = await AuthRepository.register(emailLimpio, password as string, datosLimpios);
            const userId = authResponse.user?.id;

            if (!userId) throw new Error("No se ha devuelto el ID del usuario.");

            setSuccessMessage('¡Registro completado con éxito! Preparando tu entorno...');

            setTimeout(() => {
                if (onClose) onClose();
                else navigate('/');
            }, 3000);

        } catch (error: any) {
            console.error("Error en registro:", error);
            if (error.status === 400 || error.message?.includes('already registered')) {
                setAuthError('Este correo electrónico ya está registrado en FITBOX.');
            } else if (error.code === '23505' || error.message?.includes('Database error saving new user')) {
                setAuthError('El DNI o el correo introducido ya pertenecen a un usuario registrado.');
            } else {
                setAuthError('Ocurrió un error inesperado al intentar crear la cuenta.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="fixed inset-0 z-100 bg-black/40 backdrop-blur-md overflow-y-auto p-4 sm:p-6 animate-in fade-in duration-300">

            {!onClose && (
                <>
                    <div className="fixed inset-0 bg-linear-to-br from-neutral-950 via-red-900/10 to-neutral-950 z-[-1] pointer-events-none"></div>
                    <div className="fixed inset-0 opacity-[0.03] z-[-1] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
                </>
            )}

            <div className="flex min-h-full items-center justify-center py-10">
                <Card className="w-full max-w-3xl p-8 shadow-2xl bg-neutral-950/90 border-neutral-800 relative">

                    {onClose && (
                        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-fitbox-red transition-colors">
                            <X className="size-6" />
                        </button>
                    )}

                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-extrabold text-white tracking-tight italic uppercase">
                            FIT<span className="text-fitbox-red">BOX</span>
                        </h1>
                        <p className="text-fitbox-text-muted mt-2">Formulario de Inscripción</p>
                    </div>

                    <h2 className="text-2xl font-bold mb-6 text-white text-center">
                        Formulario de Inscripción
                    </h2>

                    {authError && <Alert type="error" message={authError} />}
                    {successMessage && <Alert type="success" message={successMessage} />}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                        <div className="flex flex-col items-center justify-center mb-8">
                            <label htmlFor="reg-avatar" className="cursor-pointer relative group block">
                                <Avatar className="size-24 border-2 border-dashed border-neutral-700 group-hover:border-fitbox-red transition-colors shadow-lg">
                                    {avatarPreview ? (
                                        <AvatarImage src={avatarPreview} className="object-cover" />
                                    ) : (
                                        <AvatarFallback className="bg-neutral-900 text-neutral-500 flex flex-col items-center justify-center">
                                            <Camera className="size-8 mb-1" />
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                    <span className="text-xs font-bold text-white">Subir Foto</span>
                                </div>
                                <input id="reg-avatar" type="file" accept="image/jpeg, image/png, image/jpg, image/webp" className="hidden" onChange={handleAvatarSelection} />
                            </label>
                            <p className="text-xs text-gray-500 mt-3 uppercase tracking-wider font-bold">Foto de Perfil (Opcional)</p>
                        </div>

                        <div>
                            <h3 className="text-fitbox-red font-semibold mb-4 border-b border-neutral-800 pb-2">Datos Personales</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                <div className="space-y-2">
                                    <label htmlFor="reg-nombre" className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Nombre</label>
                                    <Input
                                        id="reg-nombre"
                                        placeholder="Ej. Alberto"
                                        className={`bg-neutral-900 border-neutral-800 ${errors.nombre ? 'border-red-500' : 'focus:border-fitbox-red'}`}
                                        {...register("nombre", {
                                            required: "El nombre es obligatorio",
                                            minLength: { value: 2, message: "El nombre debe tener al menos 2 caracteres" },
                                            pattern: { value: REGEX.TEXTO_PURO, message: "Solo letras y espacios permitidos" },
                                            onChange: (e) => {
                                                const valorLimpio = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                                                setValue("nombre", valorLimpio, { shouldValidate: true });
                                            }
                                        })}
                                    />
                                    {errors.nombre && <span className="text-xs text-red-500 font-medium">{errors.nombre.message}</span>}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="reg-apellidos" className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Apellidos</label>
                                    <Input
                                        id="reg-apellidos"
                                        placeholder="Ej. García"
                                        className={`bg-neutral-900 border-neutral-800 ${errors.apellidos ? 'border-red-500' : 'focus:border-fitbox-red'}`}
                                        {...register("apellidos", {
                                            required: "Los apellidos son obligatorios",
                                            minLength: { value: 2, message: "Los apellidos deben tener al menos 2 caracteres" },
                                            pattern: { value: REGEX.TEXTO_PURO, message: "Solo letras y espacios permitidos" },
                                            onChange: (e) => {
                                                const valorLimpio = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                                                setValue("apellidos", valorLimpio, { shouldValidate: true });
                                            }
                                        })}
                                    />
                                    {errors.apellidos && <span className="text-xs text-red-500 font-medium">{errors.apellidos.message}</span>}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="reg-dni" className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">DNI / NIE</label>
                                    <Input
                                        id="reg-dni"
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
                                            setValue("dni", limpiarDNI(e.target.value), { shouldValidate: true });
                                        }}
                                    />
                                    {errors.dni && <span className="text-xs text-red-500 font-medium">{errors.dni.message}</span>}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="reg-fecha" className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Fecha de Nacimiento</label>
                                    <p className="text-[10px] text-gray-600 italic mb-1">Debes tener entre 16 y 90 años</p>
                                    <Input
                                        id="reg-fecha"
                                        type="date"
                                        className={`bg-neutral-900 border-neutral-800 text-white ${errors.fecha_nacimiento ? 'border-red-500' : 'focus:border-fitbox-red'}`}
                                        {...register("fecha_nacimiento", {
                                            required: "La fecha es obligatoria",
                                            validate: (value) => {
                                                if (!value) return "La fecha es obligatoria";
                                                
                                                // Validar que el año tenga exactamente 4 dígitos
                                                const yearMatch = value.match(/^(\d{4})-/);
                                                if (!yearMatch || yearMatch[1].length !== 4) {
                                                    return "El año debe tener exactamente 4 dígitos";
                                                }
                                                
                                                const hoy = new Date();
                                                const fechaNac = new Date(value);
                                                
                                                // Evitar fechas futuras
                                                if (fechaNac > hoy) {
                                                    return "La fecha de nacimiento no puede ser futura";
                                                }
                                                
                                                // Calcular edad exacta
                                                let edad = hoy.getFullYear() - fechaNac.getFullYear();
                                                const mes = hoy.getMonth() - fechaNac.getMonth();
                                                
                                                if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
                                                    edad--;
                                                }
                                                
                                                // Validar rango de edad
                                                if (edad < 16) {
                                                    return `Tienes ${edad} años. Debes tener mínimo 16 años para registrarte.`;
                                                }
                                                if (edad > 90) {
                                                    return `Tienes ${edad} años. No se permite registrar personas mayores de 90 años.`;
                                                }
                                                
                                                return true;
                                            }
                                        })}
                                    />
                                    {errors.fecha_nacimiento && <span className="text-xs text-red-500 font-medium">{errors.fecha_nacimiento.message}</span>}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label htmlFor="reg-sexo" className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Sexo</label>
                                    <select
                                        id="reg-sexo"
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

                        <div>
                            <h3 className="text-fitbox-red font-semibold mb-4 border-b border-neutral-800 pb-2">Contacto y Localización</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                <div className="space-y-2 md:col-span-2">
                                    <label htmlFor="reg-telefono" className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Teléfono de Contacto</label>
                                    <Input
                                        id="reg-telefono"
                                        type="tel"
                                        placeholder="600 000 000"
                                        className={`bg-neutral-900 border-neutral-800 ${errors.telefono ? 'border-red-500' : 'focus:border-fitbox-red'}`}
                                        {...register("telefono", {
                                            required: "El teléfono es obligatorio",
                                            minLength: { value: 9, message: "El teléfono debe tener 9 dígitos" },
                                            maxLength: { value: 9, message: "El teléfono debe tener exactamente 9 dígitos" },
                                            pattern: { value: REGEX.TELEFONO, message: "Debe ser un teléfono español válido (6, 7, 8 o 9 seguido de 8 dígitos)" }
                                        })}
                                        onChange={(e) => {
                                            const valorLimpio = e.target.value.replace(/\D/g, '').slice(0, 9);
                                            setValue("telefono", valorLimpio, { shouldValidate: true });
                                        }}
                                    />
                                    {errors.telefono && <span className="text-xs text-red-500 font-medium">{errors.telefono.message}</span>}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="reg-pais" className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">País</label>
                                    <Input
                                        id="reg-pais"
                                        placeholder="Ej. España"
                                        className={`bg-neutral-900 border-neutral-800 ${errors.pais ? 'border-red-500' : 'focus:border-fitbox-red'}`}
                                        {...register("pais", {
                                            required: "Obligatorio",
                                            onChange: (e) => {
                                                const valorLimpio = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                                                setValue("pais", valorLimpio, { shouldValidate: true });
                                            }
                                        })}
                                    />
                                    {errors.pais && <span className="text-xs text-red-500 font-medium">{errors.pais.message}</span>}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="reg-provincia" className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Provincia</label>
                                    <Input
                                        id="reg-provincia"
                                        placeholder="Ej. Madrid"
                                        className={`bg-neutral-900 border-neutral-800 ${errors.provincia ? 'border-red-500' : 'focus:border-fitbox-red'}`}
                                        {...register("provincia", {
                                            required: "Obligatorio",
                                            onChange: (e) => {
                                                const valorLimpio = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                                                setValue("provincia", valorLimpio, { shouldValidate: true });
                                            }
                                        })}
                                    />
                                    {errors.provincia && <span className="text-xs text-red-500 font-medium">{errors.provincia.message}</span>}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="reg-localidad" className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Localidad / Ciudad</label>
                                    <Input
                                        id="reg-localidad"
                                        placeholder="Ej. Getafe"
                                        className={`bg-neutral-900 border-neutral-800 ${errors.localidad ? 'border-red-500' : 'focus:border-fitbox-red'}`}
                                        {...register("localidad", {
                                            required: "Obligatorio",
                                            onChange: (e) => {
                                                const valorLimpio = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                                                setValue("localidad", valorLimpio, { shouldValidate: true });
                                            }
                                        })}
                                    />
                                    {errors.localidad && <span className="text-xs text-red-500 font-medium">{errors.localidad.message}</span>}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="reg-cp" className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Código Postal</label>
                                    <Input
                                        id="reg-cp"
                                        placeholder="28000"
                                        className={`bg-neutral-900 border-neutral-800 ${errors.codigo_postal ? 'border-red-500' : 'focus:border-fitbox-red'}`}
                                        {...register("codigo_postal", {
                                            required: "El código postal es obligatorio",
                                            minLength: { value: 5, message: "El código postal debe tener 5 dígitos" },
                                            maxLength: { value: 5, message: "El código postal debe tener exactamente 5 dígitos" },
                                            pattern: { value: REGEX.CODIGO_POSTAL, message: "Código postal español inválido" }
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

                        <div>
                            <h3 className="text-fitbox-red font-semibold mb-4 border-b border-neutral-800 pb-2">Datos de Acceso</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                <div className="md:col-span-2 space-y-2">
                                    <label htmlFor="reg-email" className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Correo Electrónico</label>
                                    <Input
                                        id="reg-email"
                                        type="email"
                                        placeholder="ejemplo@correo.com"
                                        className={`bg-neutral-900 border-neutral-800 ${errors.email ? 'border-red-500' : 'focus:border-fitbox-red'}`}
                                        {...register("email", {
                                            required: "El correo es obligatorio",
                                            pattern: { value: REGEX.EMAIL_GENERAL, message: "Correo debe ser válido (soportados: es, com, org, net, eu, info, cat, gal)" },
                                            onChange: (e) => {
                                                setValue("email", e.target.value.replace(/\s/g, ''), { shouldValidate: true });
                                            }
                                        })}
                                    />
                                    {errors.email && <span className="text-xs text-red-500 font-medium">{errors.email.message}</span>}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="reg-password" className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Contraseña</label>
                                    <Input
                                        id="reg-password"
                                        type="password"
                                        placeholder="Mínimo 6 caracteres"
                                        className={`bg-neutral-900 border-neutral-800 ${errors.password ? 'border-red-500' : 'focus:border-fitbox-red'}`}
                                        {...register("password", {
                                            required: "La contraseña es obligatoria",
                                            minLength: { value: 6, message: "La contraseña debe tener al menos 6 caracteres" },
                                            pattern: { value: REGEX.PASSWORD, message: "La contraseña debe tener al menos 6 caracteres" }
                                        })}
                                    />
                                    {errors.password && <span className="text-xs text-red-500 font-medium">{errors.password.message}</span>}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="reg-confirm" className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Confirmar Contraseña</label>
                                    <Input
                                        id="reg-confirm"
                                        type="password"
                                        placeholder="Repite la contraseña"
                                        className={`bg-neutral-900 border-neutral-800 ${errors.confirmPassword ? 'border-red-500' : 'focus:border-fitbox-red'}`}
                                        {...register("confirmPassword", {
                                            required: "Debes confirmar la contraseña",
                                            validate: val => val === watchPassword || "Las contraseñas no coinciden"
                                        })}
                                    />
                                    {errors.confirmPassword && <span className="text-xs text-red-500 font-medium">{errors.confirmPassword.message}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg">
                                <input 
                                    type="checkbox" 
                                    id="aceptarTerminos"
                                    {...register("aceptarTerminos", {
                                        required: "Debes aceptar los términos y condiciones"
                                    })}
                                    className="w-5 h-5 mt-1 cursor-pointer accent-fitbox-red"
                                />
                                <label htmlFor="aceptarTerminos" className="text-xs text-gray-400 cursor-pointer flex-1">
                                    Acepto la{' '}
                                    <button
                                        type="button"
                                        onClick={() => setPolicyModalOpen(true)}
                                        className="text-fitbox-red hover:underline font-bold"
                                    >
                                        Política de Privacidad y Términos de Servicio
                                    </button>
                                    {' '}de FITBOX
                                </label>
                            </div>
                            {errors.aceptarTerminos && <span className="text-xs text-red-500 font-medium block">{errors.aceptarTerminos.message}</span>}
                        </div>

                        <div className="pt-6">
                            <Button type="submit" className="w-full bg-fitbox-red hover:bg-red-700 text-white font-bold py-6 text-lg shadow-lg" disabled={isLoading || !watchAceptarTerminos}>
                                {isLoading ? 'Creando ficha de socio...' : 'Completar Registro'}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-8 text-center text-sm text-fitbox-text-muted">
                        ¿Ya eres socio?{' '}
                        <button
                            type="button"
                            onClick={() => {
                                if (onShowLogin) {
                                    onShowLogin();
                                } else if (onClose) {
                                    onClose();
                                } else {
                                    navigate('/');
                                }
                            }}
                            className="text-red-700 hover:text-white font-bold transition-colors"
                        >
                            Inicia Sesión aquí
                        </button>
                    </div>
                </Card>
            </div>

            <PolicyModal isOpen={policyModalOpen} onClose={() => setPolicyModalOpen(false)} />
        </div>
    );
};