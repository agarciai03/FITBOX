import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { LogOut, Save, Camera, CheckCircle, Shield } from 'lucide-react'; // <-- AÑADIDO: Shield
import { supabase } from '../database/supabase/Client';
import { REGEX } from '../utils/regex';
import { AuthRepository } from '../database/repositories/AuthRepository'; // <-- AÑADIDO: AuthRepository

export const PerfilPage = () => {
    const { profile, logout, setUser } = useAuthStore();
    const navigate = useNavigate();

    // 1. ESTADO LOCAL PARA EL FORMULARIO
    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        telefono: '',
        sexo: '',
        pais: '',
        provincia: '',
        localidad: '',
        codigo_postal: '',
        avatar_url: ''
    });

    // --- NUEVO: ESTADOS PARA CAMBIO DE CONTRASEÑA ---
    const [passwords, setPasswords] = useState({ new: '', confirm: '' });
    const [passLoading, setPassLoading] = useState(false);
    // ------------------------------------------------

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // 2. CARGAMOS LOS DATOS DEL PERFIL AL INICIAR
    useEffect(() => {
        if (profile) {
            setFormData({
                nombre: profile.nombre || '',
                apellidos: profile.apellidos || '',
                telefono: profile.telefono || '',
                sexo: profile.sexo || '',
                pais: profile.pais || '',
                provincia: profile.provincia || '',
                localidad: profile.localidad || '',
                codigo_postal: profile.codigo_postal || '',
                avatar_url: profile.avatar_url || ''
            });
        }
    }, [profile]);

    if (!profile) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-white">Cargando perfil...</p>
            </div>
        );
    }

    const inicial = profile.nombre ? profile.nombre.charAt(0).toUpperCase() : 'F';

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    // 3. FUNCIÓN: SUBIR FOTO DE AVATAR A SUPABASE STORAGE
    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = event.target.files?.[0];
            if (!file) return;

            // --- VALIDACIONES DE SEGURIDAD DEL AVATAR ---
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setError("Formato no válido. Solo se permiten imágenes (JPG, JPEG, PNG, WEBP).");
                return;
            }

            const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSizeInBytes) {
                setError("La imagen es demasiado pesada. El tamaño máximo es 5MB.");
                return;
            }
            // --------------------------------------------

            setIsLoading(true);
            setError(null);

            // Generamos un nombre único para evitar que se sobreescriba si tienen el mismo nombre
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${profile.id_usuario}/${fileName}`;

            // Subimos la imagen al bucket 'avatars'
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Conseguimos la URL pública para mostrarla
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Actualizamos el formulario con la nueva URL
            setFormData({ ...formData, avatar_url: publicUrl });
            setSuccessMessage("¡Foto subida! Haz clic en 'Guardar Cambios' para confirmarla.");

        } catch (err: any) {
            console.error("Error subiendo avatar:", err);
            setError("No se pudo subir la imagen. Comprueba que el bucket 'avatars' esté creado y sea público en Supabase.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- NUEVO: FUNCIÓN PARA CAMBIAR CONTRASEÑA EN VIVO ---
    const handleUpdatePassword = async () => {
        setError(null);
        setSuccessMessage(null);

        if (passwords.new.length < 6) return setError("La nueva contraseña debe tener al menos 6 caracteres.");
        if (passwords.new !== passwords.confirm) return setError("Las contraseñas no coinciden.");

        setPassLoading(true);
        try {
            await AuthRepository.updatePassword(passwords.new);
            setSuccessMessage("¡Contraseña actualizada con éxito!");
            setPasswords({ new: '', confirm: '' });
        } catch {
            setError("No se ha podido actualizar la contraseña.");
        } finally {
            setPassLoading(false);
        }
    };

    // FUNCIÓN: GUARDAR TODOS LOS CAMBIOS Y VALIDAR CON REGEX
    const handleGuardarCambios = async () => {
        setError(null);
        setSuccessMessage(null);
        setIsLoading(true);

        const telefonoLimpio = formData.telefono.replace(/\s/g, '');
        const nombreLimpio = formData.nombre.trim();
        const apellidosLimpio = formData.apellidos.trim();

        // --- VALIDACIONES REGEX ---
        if (!nombreLimpio || !apellidosLimpio) {
            setError("El nombre y los apellidos son obligatorios.");
            setIsLoading(false); return;
        }
        if (!REGEX.TEXTO_PURO.test(nombreLimpio) || !REGEX.TEXTO_PURO.test(apellidosLimpio)) {
            setError("El nombre y apellidos solo pueden contener letras y espacios.");
            setIsLoading(false); return;
        }
        if (telefonoLimpio && !REGEX.TELEFONO.test(telefonoLimpio)) {
            setError("El teléfono debe tener exactamente 9 dígitos numéricos.");
            setIsLoading(false); return;
        }
        if (formData.codigo_postal && !REGEX.CODIGO_POSTAL.test(formData.codigo_postal)) {
            setError("El código postal no tiene un formato español válido (Debe ser un número de 5 cifras real).");
            setIsLoading(false); return;
        }

        try {
            // Empaquetamos los datos, convirtiendo los vacíos ("") en nulls para que Supabase no explote
            const datosAActualizar = {
                nombre: nombreLimpio,
                apellidos: apellidosLimpio,
                telefono: telefonoLimpio || null,
                sexo: formData.sexo || null,
                pais: formData.pais || null,
                provincia: formData.provincia || null,
                localidad: formData.localidad || null,
                codigo_postal: formData.codigo_postal || null,
                avatar_url: formData.avatar_url || null
            };

            const { error: updateError } = await supabase
                .from('usuarios')
                .update(datosAActualizar)
                .eq('id_usuario', profile.id_usuario);

            if (updateError) throw updateError;

            // Actualizamos Zustand para que el Header cambie en tiempo real sin F5
            const { data: authData } = await supabase.auth.getUser();
            if (authData.user) {
                await setUser(authData.user);
            }

            setSuccessMessage("¡Tus datos han sido actualizados correctamente!");

        } catch (err: any) {
            // AHORA LA CONSOLA NOS DIRÁ EL ERROR EXACTO DE POSTGRES
            console.error("Error exacto de Supabase:", err.message, err.details, err.hint);

            // Si el error dice algo de "avatar_url", avisamos al usuario
            if (err.message?.includes('avatar_url')) {
                setError("Falta crear la columna 'avatar_url' (text) en la tabla 'usuarios' de Supabase.");
            } else {
                setError(`Error de base de datos: ${err.message || "No se pudieron guardar los cambios."}`);
            }
        } finally {
            setIsLoading(false);
            setTimeout(() => setSuccessMessage(null), 5000);
        }
    };

    // Estilos reutilizables
    const readOnlyInputStyle = "bg-neutral-900/40 border-neutral-800 text-gray-500 cursor-not-allowed focus-visible:ring-0 focus-visible:border-neutral-800";
    const editableInputStyle = "bg-neutral-900 border-neutral-800 text-white focus-visible:ring-1 focus-visible:ring-fitbox-red focus-visible:border-fitbox-red transition-all";

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            <h1 className="text-3xl font-extrabold text-white mb-8">Mi Perfil</h1>

            <Card className="bg-fitbox-card border-neutral-800 shadow-xl overflow-hidden p-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-neutral-800 p-6 sm:p-8 bg-black/20">

                    {/* Agrupamos Avatar y Textos juntos a la izquierda */}
                    <div className="flex items-center gap-5 w-full sm:w-auto">

                        {/* Input oculto de cámara envuelto en un Label interactivo */}
                        <label className="cursor-pointer relative group block shrink-0">
                            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-fitbox-red shadow-lg transition-opacity group-hover:opacity-50">
                                {formData.avatar_url && (
                                    <AvatarImage src={formData.avatar_url} className="object-cover" />
                                )}
                                <AvatarFallback className="bg-neutral-900 text-fitbox-red text-2xl sm:text-3xl font-bold">
                                    {inicial}
                                </AvatarFallback>
                            </Avatar>
                            {/* Icono de cámara al pasar el ratón */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-8 h-8 text-white" />
                            </div>
                            <input
                                type="file"
                                accept="image/jpeg, image/png, image/jpg, image/webp"
                                className="hidden"
                                onChange={handleAvatarUpload}
                                disabled={isLoading}
                            />
                        </label>

                        {/* Textos del Perfil */}
                        <div className="space-y-1">
                            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                                {formData.nombre} {formData.apellidos}
                            </h2>
                            <p className="text-fitbox-text-muted text-sm sm:text-lg capitalize">
                                {profile.roles?.nombre_rol || 'Socio'} de FITBOX
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="destructive"
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 font-bold transition-colors shrink-0 w-full sm:w-auto shadow-md"
                    >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                    </Button>
                </div>

                <CardContent className="space-y-10 p-6 sm:p-8">

                    {/* ALERTAS DE GUARDADO */}
                    {error && <Alert type="error" message={error} />}
                    {successMessage && (
                        <div className="p-4 bg-green-500/10 border border-green-500/50 text-green-500 rounded-lg flex items-center gap-2 font-bold">
                            <CheckCircle className="w-5 h-5 shrink-0" /> <p>{successMessage}</p>
                        </div>
                    )}

                    {/* BLOQUE 1: Datos de la Cuenta (SOLO LECTURA) */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white border-b border-neutral-800 pb-2">
                            Cuenta y Seguridad <span className="text-xs text-gray-500 font-normal ml-2">(Lectura)</span>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div className="space-y-2">
                                <Label className="text-fitbox-text-muted font-bold text-xs uppercase tracking-wider">Correo Electrónico</Label>
                                <Input value={profile.email || 'No especificado'} readOnly className={readOnlyInputStyle} />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-fitbox-text-muted font-bold text-xs uppercase tracking-wider">DNI / NIE</Label>
                                <Input value={profile.dni || 'No especificado'} readOnly className={readOnlyInputStyle} />
                            </div>
                        </div>
                    </div>

                    {/* --- NUEVO BLOQUE: SEGURIDAD Y CONTRASEÑA --- */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white border-b border-neutral-800 pb-2 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-fitbox-red" />
                            Seguridad de la cuenta
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div className="space-y-2">
                                <Label className="text-gray-300 font-bold text-xs uppercase tracking-wider">Nueva Contraseña</Label>
                                <Input
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    value={passwords.new}
                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                    className={editableInputStyle}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-300 font-bold text-xs uppercase tracking-wider">Repetir Contraseña</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="password"
                                        placeholder="Confirma la contraseña"
                                        value={passwords.confirm}
                                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                        className={editableInputStyle}
                                    />
                                    <Button
                                        onClick={handleUpdatePassword}
                                        disabled={passLoading || !passwords.new}
                                        className="bg-neutral-800 hover:bg-fitbox-red transition-colors font-bold border border-neutral-700"
                                    >
                                        {passLoading ? '...' : 'Actualizar'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* ------------------------------------------- */}

                    {/* BLOQUE 2: Información Personal (EDITABLE) */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white border-b border-neutral-800 pb-2">
                            Información Personal
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="nombre" className="text-gray-300 font-bold text-xs uppercase tracking-wider">Nombre</Label>
                                <Input
                                    id="nombre"
                                    value={formData.nombre}
                                    // Usamos replace para eliminar cualquier número antes de actualizar el estado.
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '') })}
                                    className={editableInputStyle}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="apellidos" className="text-gray-300 font-bold text-xs uppercase tracking-wider">Apellidos</Label>
                                <Input
                                    id="apellidos"
                                    value={formData.apellidos}
                                    // Igual que el nombre, protección pura frente a errores tipográficos de los usuarios.
                                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '') })}
                                    className={editableInputStyle}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sexo" className="text-gray-300 font-bold text-xs uppercase tracking-wider">Sexo</Label>
                                <select
                                    id="sexo"
                                    value={formData.sexo}
                                    onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                                    className={`w-full h-10 px-3 py-2 rounded-md ${editableInputStyle} capitalize`}
                                >
                                    <option value="" disabled>Seleccionar...</option>
                                    <option value="Hombre">Hombre</option>
                                    <option value="Mujer">Mujer</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="telefono" className="text-gray-300 font-bold text-xs uppercase tracking-wider">Teléfono de Contacto</Label>
                                <Input
                                    id="telefono" type="tel" placeholder="600000000"
                                    value={formData.telefono}
                                    onChange={(e) => {
                                        // \D detecta lo que NO es un número, lo elimina, y limitamos a 9 caracteres.
                                        const valorLimpio = e.target.value.replace(/\D/g, '');
                                        if (valorLimpio.length <= 9) setFormData({ ...formData, telefono: valorLimpio });
                                    }}
                                    className={editableInputStyle}
                                />
                            </div>
                        </div>
                    </div>

                    {/* BLOQUE 3: Dirección (EDITABLE) */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white border-b border-neutral-800 pb-2">
                            Ubicación
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                            <div className="space-y-2 lg:col-span-2">
                                <Label htmlFor="pais" className="text-gray-300 font-bold text-xs uppercase tracking-wider">País</Label>
                                <Input
                                    id="pais"
                                    value={formData.pais}
                                    // No permitimos números en campos de localización.
                                    onChange={(e) => setFormData({ ...formData, pais: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '') })}
                                    className={editableInputStyle}
                                />
                            </div>

                            <div className="space-y-2 lg:col-span-2">
                                <Label htmlFor="provincia" className="text-gray-300 font-bold text-xs uppercase tracking-wider">Provincia</Label>
                                <Input
                                    id="provincia"
                                    value={formData.provincia}
                                    onChange={(e) => setFormData({ ...formData, provincia: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '') })}
                                    className={editableInputStyle}
                                />
                            </div>

                            <div className="space-y-2 lg:col-span-3">
                                <Label htmlFor="localidad" className="text-gray-300 font-bold text-xs uppercase tracking-wider">Localidad / Ciudad</Label>
                                <Input
                                    id="localidad"
                                    value={formData.localidad}
                                    onChange={(e) => setFormData({ ...formData, localidad: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '') })}
                                    className={editableInputStyle}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cp" className="text-gray-300 font-bold text-xs uppercase tracking-wider">Código Postal</Label>
                                <Input
                                    id="cp" placeholder="06800"
                                    value={formData.codigo_postal}
                                    onChange={(e) => {
                                        // Forzamos máximo 5 dígitos puramente numéricos.
                                        const valorLimpio = e.target.value.replace(/\D/g, '');
                                        if (valorLimpio.length <= 5) setFormData({ ...formData, codigo_postal: valorLimpio });
                                    }}
                                    className={editableInputStyle}
                                />
                            </div>
                        </div>
                    </div>

                    {/* BOTÓN DE GUARDAR */}
                    <div className="pt-6 border-t border-neutral-800 flex justify-end">
                        <Button
                            onClick={handleGuardarCambios}
                            disabled={isLoading}
                            className="bg-fitbox-red hover:bg-red-700 text-white font-bold px-8 py-6 h-auto text-lg w-full sm:w-auto shadow-lg"
                        >
                            <Save className="w-5 h-5 mr-3" />
                            {isLoading ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
};