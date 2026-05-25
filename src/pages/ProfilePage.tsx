import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { LogOut, Save, Camera, CheckCircle, Shield, Trophy, Zap, Trash2 } from 'lucide-react';
import { supabase } from '../database/supabase/Client';
import { REGEX } from '../utils/regex';
import { AuthRepository } from '../database/repositories/AuthRepository';
import { UserRepository } from '../database/repositories/UserRepository';

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

    const [passwords, setPasswords] = useState({ new: '', confirm: '' });
    const [passLoading, setPassLoading] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loadingBaja, setLoadingBaja] = useState(false);

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
    const isSocio = profile.roles?.nombre_rol === 'Socio' || profile.id_rol === 3;

    // --- CÁLCULOS DE GAMIFICACIÓN ---
    const nivel = (profile as any).nivel || 1;
    const xpActual = (profile as any).xp || 0;
    const xpParaSiguienteNivel = nivel * 200; // Fórmula: Nivel actual * 200
    const porcentajeXP = Math.min((xpActual / xpParaSiguienteNivel) * 100, 100);
    const xpFaltante = xpParaSiguienteNivel - xpActual;

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    // Función para dar de baja/cambiar estado a pendiente - Usuario deja de pagar y pierde acceso
    const handleDarDeBaja = async () => {
        if (!window.confirm('¿Estás seguro de que deseas darte de baja? Perderás acceso a todas las funcionalidades hasta que vuelvas a pagar.')) {
            return;
        }

        setLoadingBaja(true);
        try {
            await UserRepository.updateEstadoPago(profile.id_usuario, 'pendiente');
            await new Promise(resolve => setTimeout(resolve, 1000));
            await logout();
            navigate('/');
        } catch (error) {
            console.error("Error al dar de baja:", error);
            setError('Ocurrió un error al procesar tu baja. Intenta nuevamente.');
            setLoadingBaja(false);
        }
    };

    // 3. FUNCIÓN: SUBIR FOTO DE AVATAR A SUPABASE STORAGE
    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = event.target.files?.[0];
            if (!file) return;

            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setError("Formato no válido. Solo se permiten imágenes (JPG, JPEG, PNG, WEBP).");
                return;
            }

            const maxSizeInBytes = 5 * 1024 * 1024;
            if (file.size > maxSizeInBytes) {
                setError("La imagen es demasiado pesada. El tamaño máximo es 5MB.");
                return;
            }

            setIsLoading(true);
            setError(null);

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${profile.id_usuario}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setFormData({ ...formData, avatar_url: publicUrl });
            setSuccessMessage("¡Foto subida! Haz clic en 'Guardar Cambios' para confirmarla.");

        } catch (err: any) {
            console.error("Error subiendo avatar:", err);
            setError("No se pudo subir la imagen. Comprueba que el bucket 'avatars' esté creado y sea público en Supabase.");
        } finally {
            setIsLoading(false);
        }
    };

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

    const handleGuardarCambios = async () => {
        setError(null);
        setSuccessMessage(null);
        setIsLoading(true);

        const telefonoLimpio = formData.telefono.replace(/\s/g, '');
        const nombreLimpio = formData.nombre.trim();
        const apellidosLimpio = formData.apellidos.trim();

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

            const { data: authData } = await supabase.auth.getUser();
            if (authData.user) {
                await setUser(authData.user);
            }

            setSuccessMessage("¡Tus datos han sido actualizados correctamente!");
        } catch (err: any) {
            console.error("Error exacto de Supabase:", err.message, err.details, err.hint);
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

    const readOnlyInputStyle = "bg-neutral-900/40 border-neutral-800 text-gray-500 cursor-not-allowed focus-visible:ring-0 focus-visible:border-neutral-800";
    const editableInputStyle = "bg-neutral-900 border-neutral-800 text-white focus-visible:ring-1 focus-visible:ring-fitbox-red focus-visible:border-fitbox-red transition-all";

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            <h1 className="text-3xl font-extrabold text-white mb-8">Mi Perfil</h1>

            <Card className="bg-fitbox-card border-neutral-800 shadow-xl overflow-hidden p-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-neutral-800 p-6 sm:p-8 bg-black/20">

                    {/* Agrupamos Avatar y Textos juntos a la izquierda */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 w-full sm:w-auto">
                        <label className="cursor-pointer relative group block shrink-0">
                            <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-2 border-fitbox-red shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-opacity group-hover:opacity-50">
                                {formData.avatar_url && (
                                    <AvatarImage src={formData.avatar_url} className="object-cover" />
                                )}
                                <AvatarFallback className="bg-neutral-900 text-fitbox-red text-3xl font-bold">
                                    {inicial}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-8 h-8 text-white" />
                            </div>
                            <input type="file" accept="image/jpeg, image/png, image/jpg, image/webp" className="hidden" onChange={handleAvatarUpload} disabled={isLoading} />
                        </label>

                        {/* --- Textos del Perfil y BARRA DE XP (SÓLO SOCIOS) --- */}
                        <div className="flex flex-col items-center sm:items-start w-full">
                            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight text-center sm:text-left">
                                {formData.nombre} {formData.apellidos}
                            </h2>
                            <p className="text-fitbox-text-muted text-sm sm:text-base capitalize mb-4">
                                {profile.roles?.nombre_rol || 'Socio'} de FITBOX
                            </p>

                            {/* BARRA DE GAMIFICACIÓN - VISIBLE SOLO PARA SOCIOS */}
                            {isSocio && (
                                <div className="bg-neutral-900/60 border border-neutral-800 p-4 rounded-xl w-full sm:w-80 shadow-inner">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-1.5">
                                            <div className="bg-fitbox-red/20 p-1 rounded-md">
                                                <Trophy className="w-4 h-4 text-fitbox-red" />
                                            </div>
                                            <span className="text-xs font-black text-white uppercase tracking-wider">
                                                Nivel {nivel}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                            <span className="text-[10px] text-gray-400 font-bold">{xpActual} / {xpParaSiguienteNivel} XP</span>
                                        </div>
                                    </div>

                                    {/* Contenedor de la barra */}
                                    <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                                        <div
                                            className="h-full bg-fitbox-red transition-all duration-1000 ease-out relative"
                                            style={{ width: `${porcentajeXP}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/20"></div>
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-gray-500 mt-2 text-right font-medium uppercase tracking-widest">
                                        A {xpFaltante} XP del siguiente nivel
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <Button
                        variant="destructive"
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 font-bold transition-colors shrink-0 w-full sm:w-auto shadow-md self-start sm:self-center"
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

                    {/* --- BLOQUE: SEGURIDAD Y CONTRASEÑA --- */}
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
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value.replace(/[^a-zA-Z \s]/g, '') })}
                                    className={editableInputStyle}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="apellidos" className="text-gray-300 font-bold text-xs uppercase tracking-wider">Apellidos</Label>
                                <Input
                                    id="apellidos"
                                    value={formData.apellidos}
                                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value.replace(/[^a-zA-Z \s]/g, '') })}
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
                                    onChange={(e) => setFormData({ ...formData, pais: e.target.value.replace(/[^a-zA-Z \s]/g, '') })}
                                    className={editableInputStyle}
                                />
                            </div>
                            <div className="space-y-2 lg:col-span-2">
                                <Label htmlFor="provincia" className="text-gray-300 font-bold text-xs uppercase tracking-wider">Provincia</Label>
                                <Input
                                    id="provincia"
                                    value={formData.provincia}
                                    onChange={(e) => setFormData({ ...formData, provincia: e.target.value.replace(/[^a-zA-Z \s]/g, '') })}
                                    className={editableInputStyle}
                                />
                            </div>
                            <div className="space-y-2 lg:col-span-3">
                                <Label htmlFor="localidad" className="text-gray-300 font-bold text-xs uppercase tracking-wider">Localidad / Ciudad</Label>
                                <Input
                                    id="localidad"
                                    value={formData.localidad}
                                    onChange={(e) => setFormData({ ...formData, localidad: e.target.value.replace(/[^a-zA-Z \s]/g, '') })}
                                    className={editableInputStyle}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cp" className="text-gray-300 font-bold text-xs uppercase tracking-wider">Código Postal</Label>
                                <Input
                                    id="cp" placeholder="06800"
                                    value={formData.codigo_postal}
                                    onChange={(e) => {
                                        const valorLimpio = e.target.value.replace(/\D/g, '');
                                        if (valorLimpio.length <= 5) setFormData({ ...formData, codigo_postal: valorLimpio });
                                    }}
                                    className={editableInputStyle}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-neutral-800 flex gap-2">
                        <Button
                            onClick={handleDarDeBaja}
                            disabled={loadingBaja}
                            className="bg-red-600/80 hover:bg-red-700 text-white font-bold transition-colors flex items-center gap-2"
                            title="Dar de baja tu suscripción. Perderás acceso temporal."
                        >
                            <Trash2 className="w-4 h-4" />
                            {loadingBaja ? 'Procesando baja...' : 'Dar de Baja Suscripción'}
                        </Button>
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