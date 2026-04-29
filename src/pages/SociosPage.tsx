import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { UserRepository, type Usuario } from '../database/repositories/UserRepository';
import { ClassRepository, type Disciplina } from '../database/repositories/ClassRepository';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Users, Shield, UserCheck, AlertTriangle, UserPlus, CheckCircle, Trash2, Edit2, Camera } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { supabase } from '../database/supabase/Client';
import { REGEX, isValidDNI, calcularLetraDNI } from '../components/utils/regex';
// --- AÑADIDO: Importamos tu AuthRepository (Cliente en la sombra) ---
import { AuthRepository } from '../database/repositories/AuthRepository';

export const SociosPage = () => {
    const profile = useAuthStore((state) => state.profile);
    const rol = profile?.roles?.nombre_rol || 'Socio';
    const isAdmin = rol === 'Administrador';

    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [isCreandoStaff, setIsCreandoStaff] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    // ESTADO COMPLETO 
    const [nuevoStaff, setNuevoStaff] = useState({
        nombre: '',
        apellidos: '',
        dni: '',
        telefono: '',
        email: '',
        password: '',
        confirmPassword: '', // <-- AÑADIDO: Confirmar contraseña
        id_rol: 2,
        sexo: '',
        pais: '',
        provincia: '',
        localidad: '',
        codigo_postal: '',
        avatar_url: '',
        id_disciplina: ''
    });

    const [usuarioAEditar, setUsuarioAEditar] = useState<Usuario | null>(null);

    const cargarUsuarios = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await UserRepository.getAllUsers();
            setUsuarios(data);
        } catch (errorCatch) {
            console.error("Error al cargar usuarios:", errorCatch);
            setError("No se ha podido cargar la lista de usuarios.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const cargarDisciplinas = useCallback(async () => {
        try {
            const data = await ClassRepository.getAllDisciplinas();
            setDisciplinas(data);
        } catch (errorCatch) {
            console.error("Error cargando disciplinas", errorCatch);
        }
    }, []);

    useEffect(() => {
        if (isAdmin) {
            cargarUsuarios();
            cargarDisciplinas();
        }
    }, [isAdmin, cargarUsuarios, cargarDisciplinas]);

    // --- FUNCIÓN: SUBIR FOTO DEL MONITOR ---
    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = event.target.files?.[0];
            if (!file) return;

            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
            if (!allowedTypes.includes(file.type)) return setError("Formato no válido. Solo imágenes.");
            if (file.size > 5 * 1024 * 1024) return setError("La imagen pesa más de 5MB.");

            setError(null);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `temp_monitors/${fileName}`;

            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
            setNuevoStaff({ ...nuevoStaff, avatar_url: publicUrl });
        } catch {
            setError("No se pudo subir la imagen del monitor.");
        }
    };

    // Función: Añadir Staff (REGISTRO COMPLETO CON AUTH)
    const handleContratarStaff = async () => {
        setError(null);
        setSuccessMessage(null);

        const telefonoLimpio = nuevoStaff.telefono.trim();
        const dniLimpio = nuevoStaff.dni.trim().toUpperCase();

        // 1. Comprobamos campos obligatorios (incluido confirmPassword)
        if (!nuevoStaff.nombre || !nuevoStaff.apellidos || !nuevoStaff.dni || !nuevoStaff.email || !nuevoStaff.password || !nuevoStaff.confirmPassword || !nuevoStaff.id_disciplina) {
            setError("Por favor, rellena los campos obligatorios marcados con (*). Recuerda asignar una disciplina.");
            return;
        }

        // --- Validación de coincidencia de contraseñas ---
        if (nuevoStaff.password !== nuevoStaff.confirmPassword) {
            setError("Las contraseñas no coinciden. Por favor, revísalas.");
            return;
        }

        // 2. Validaciones REGEX
        if (!REGEX.TEXTO_PURO.test(nuevoStaff.nombre.trim()) || !REGEX.TEXTO_PURO.test(nuevoStaff.apellidos.trim())) {
            setError("El nombre y los apellidos solo pueden contener letras y espacios (mínimo 2 caracteres).");
            return;
        }

        if (!isValidDNI(dniLimpio) && !REGEX.NIE.test(dniLimpio)) {
            setError("El formato del DNI o NIE no es válido, o la letra no coincide.");
            return;
        }

        if (telefonoLimpio && !REGEX.TELEFONO.test(telefonoLimpio)) {
            setError("El teléfono debe tener exactamente 9 números.");
            return;
        }

        if (!REGEX.EMAIL_GENERAL.test(nuevoStaff.email.trim())) {
            setError("El formato del correo corporativo no es válido.");
            return;
        }

        if (!REGEX.PASSWORD.test(nuevoStaff.password)) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        if (nuevoStaff.codigo_postal && !REGEX.CODIGO_POSTAL.test(nuevoStaff.codigo_postal)) {
            setError("El código postal no tiene un formato español válido (5 dígitos).");
            return;
        }

        setIsRegistering(true);

        try {
            // --- AÑADIDO: 3. Usamos AuthRepository (Cliente en la Sombra) ---
            await AuthRepository.register(nuevoStaff.email.trim(), nuevoStaff.password, {
                nombre: nuevoStaff.nombre.trim(),
                apellidos: nuevoStaff.apellidos.trim(),
                dni: dniLimpio,
                id_rol: nuevoStaff.id_rol,
                telefono: telefonoLimpio || '',
                sexo: nuevoStaff.sexo || '',
                pais: nuevoStaff.pais || '',
                provincia: nuevoStaff.provincia || '',
                localidad: nuevoStaff.localidad || '',
                codigo_postal: nuevoStaff.codigo_postal || '',
                avatar_url: nuevoStaff.avatar_url || null,
                id_disciplina: nuevoStaff.id_disciplina || null,
                fecha_nacimiento: '1990-01-01' // Dato por defecto para evitar fallos si tu BD lo pide
                ,
                email: ''
            });

            // Esperamos 1 segundo para que el Trigger termine y recargamos todo
            setTimeout(async () => {
                await cargarUsuarios();
                setIsRegistering(false);
                setSuccessMessage(`¡La ficha de ${nuevoStaff.nombre.trim()} se ha creado correctamente! Ya puede iniciar sesión.`);
                setIsCreandoStaff(false);

                // Limpiamos el formulario (Añadido confirmPassword)
                setNuevoStaff({
                    nombre: '', apellidos: '', dni: '', telefono: '', email: '', password: '', confirmPassword: '',
                    id_rol: 2, sexo: '', pais: '', provincia: '', localidad: '', codigo_postal: '',
                    avatar_url: '', id_disciplina: ''
                });
            }, 1000);

        } catch (errorCatch: any) {
            console.error("Error al registrar staff:", errorCatch);
            if (errorCatch.status === 400 || errorCatch.message?.includes('already registered')) {
                setError("El correo electrónico ya está registrado en el sistema.");
            } else if (errorCatch.code === '23505') {
                setError("Ya existe un usuario en la base de datos con ese DNI o Correo.");
            } else {
                setError(errorCatch.message || "Error al intentar crear el empleado en la base de datos.");
            }
            setIsRegistering(false); // Liberamos el botón si hay error
        }
    };

    const handleBorrarUsuario = async (id_usuario: string, nombre: string) => {
        if (!window.confirm(`¿Seguro que quieres dar de baja a ${nombre} definitivamente? Esta acción no se puede deshacer.`)) return;

        setError(null);
        setSuccessMessage(null);

        try {
            await UserRepository.deleteUser(id_usuario);
            setSuccessMessage(`El usuario ${nombre} ha sido eliminado del sistema.`);
            cargarUsuarios();
        } catch (errorCatch) {
            console.error("Error al borrar usuario:", errorCatch);
            if (errorCatch instanceof Error) setError(errorCatch.message);
            else setError("Error al intentar borrar el usuario de la base de datos.");
        }
    };

    const handleGuardarEdicion = async () => {
        if (!usuarioAEditar) return;

        if (!usuarioAEditar.nombre || !usuarioAEditar.apellidos) {
            setError("El nombre y los apellidos no pueden estar vacíos.");
            return;
        }

        setError(null);
        setSuccessMessage(null);

        try {
            await UserRepository.updateUser(usuarioAEditar.id_usuario, {
                nombre: usuarioAEditar.nombre,
                apellidos: usuarioAEditar.apellidos,
                telefono: usuarioAEditar.telefono,
                id_rol: usuarioAEditar.id_rol
            });

            setSuccessMessage(`Datos de ${usuarioAEditar.nombre} actualizados correctamente.`);
            setUsuarioAEditar(null);
            cargarUsuarios();
        } catch (errorCatch) {
            console.error("Error al actualizar usuario:", errorCatch);
            if (errorCatch instanceof Error) setError(errorCatch.message);
            else setError("Error al intentar actualizar la base de datos.");
        }
    };

    if (!isAdmin) {
        return (
            <div className="p-8 text-center">
                <div className="inline-block p-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg font-bold">
                    <AlertTriangle className="w-6 h-6 inline-block mb-1 mr-2" />
                    Acceso denegado. Área exclusiva de Dirección.
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* CABECERA */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white flex items-center gap-3 uppercase tracking-tight">
                        <Users className="w-8 h-8 text-fitbox-red" />
                        GESTIÓN DE <span className="text-fitbox-red">USUARIOS</span>
                    </h1>
                    <p className="text-fitbox-text-muted mt-1">Base de datos de Socios y Plantilla (Staff).</p>
                </div>

                <Button
                    onClick={() => {
                        setIsCreandoStaff(true);
                        setError(null);
                        setSuccessMessage(null);
                    }}
                    className="bg-fitbox-red hover:bg-red-700 font-bold"
                >
                    <UserPlus className="w-4 h-4 mr-2" /> Contratar Staff
                </Button>
            </div>

            {/* ALERTAS GENERALES */}
            {!isCreandoStaff && !usuarioAEditar && error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg flex items-center gap-2 font-bold">
                    <AlertTriangle className="w-5 h-5 shrink-0" /> <p>{error}</p>
                </div>
            )}
            {successMessage && (
                <div className="p-4 bg-green-500/10 border border-green-500/50 text-green-500 rounded-lg flex items-center gap-2 font-bold">
                    <CheckCircle className="w-5 h-5 shrink-0" /> <p>{successMessage}</p>
                </div>
            )}

            {/* TABLA DE USUARIOS */}
            <div className="bg-fitbox-card border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-800/50 text-fitbox-text-muted uppercase text-[10px] tracking-widest font-bold">
                            <tr>
                                <th className="px-6 py-4">Usuario</th>
                                <th className="px-6 py-4">Contacto</th>
                                <th className="px-6 py-4">Rol en el Gimnasio</th>
                                <th className="px-6 py-4 text-right">Estado / Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {isLoading ? (
                                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">Cargando base de datos...</td></tr>
                            ) : usuarios.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No hay usuarios registrados.</td></tr>
                            ) : (
                                usuarios.map((user) => {
                                    const esAdmin = user.id_rol === 1;
                                    const esMonitor = user.id_rol === 2;
                                    const esSocio = user.id_rol === 3;

                                    const esMiPropioUsuario = profile?.id_usuario === user.id_usuario;

                                    return (
                                        <tr key={user.id_usuario} className="hover:bg-neutral-800/20 transition-colors">
                                            <td className="px-6 py-4 font-bold text-white text-base">
                                                {user.nombre} {user.apellidos} {esMiPropioUsuario && <span className="text-fitbox-red text-xs ml-2">(Tú)</span>}
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 text-xs">
                                                <div>{user.email || 'correo@ejemplo.com'}</div>
                                                <div className="text-fitbox-text-muted mt-0.5">{user.telefono || 'Sin teléfono'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {esAdmin && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-purple-500/10 text-purple-500 border border-purple-500/20">
                                                        <Shield className="w-3.5 h-3.5" /> ADMINISTRADOR
                                                    </span>
                                                )}
                                                {esMonitor && (
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                            <UserCheck className="w-3.5 h-3.5" /> STAFF / MONITOR
                                                        </span>
                                                    </div>
                                                )}
                                                {esSocio && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-neutral-800 text-gray-300 border border-neutral-700">
                                                        <Users className="w-3.5 h-3.5" /> SOCIO (CLIENTE)
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="text-green-500 text-xs font-bold flex items-center gap-1 mr-2">
                                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Activo
                                                    </span>

                                                    {/* BOTÓN DE EDITAR */}
                                                    <button
                                                        onClick={() => {
                                                            setUsuarioAEditar(user);
                                                            setError(null);
                                                            setSuccessMessage(null);
                                                        }}
                                                        className="text-blue-400 hover:text-blue-300 p-1.5 rounded-md hover:bg-blue-500/10 transition-colors"
                                                        title="Editar datos del usuario"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>

                                                    {/* BOTÓN DE BORRAR */}
                                                    {!esMiPropioUsuario && (
                                                        <button
                                                            onClick={() => handleBorrarUsuario(user.id_usuario, user.nombre)}
                                                            className="text-red-500 hover:text-red-400 p-1.5 rounded-md hover:bg-red-500/10 transition-colors"
                                                            title="Dar de baja usuario"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL: EDITAR USUARIO */}
            {usuarioAEditar && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-fitbox-card border border-neutral-800 p-8 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col">
                        <div className="border-b border-neutral-800 pb-4 mb-6">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">
                                Editar Ficha: <span className="text-blue-400">{usuarioAEditar.nombre}</span>
                            </h3>
                            <p className="text-sm text-fitbox-text-muted mt-1">
                                {usuarioAEditar.email}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg flex items-center gap-2 font-bold">
                                <AlertTriangle className="w-5 h-5 shrink-0" /> <p>{error}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nombre</label>
                                <Input
                                    autoFocus
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                                    value={usuarioAEditar.nombre}
                                    onChange={(e) => setUsuarioAEditar({ ...usuarioAEditar, nombre: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '') })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Apellidos</label>
                                <Input
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                                    value={usuarioAEditar.apellidos}
                                    onChange={(e) => setUsuarioAEditar({ ...usuarioAEditar, apellidos: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '') })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Teléfono</label>
                                <Input
                                    type="tel"
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                                    value={usuarioAEditar.telefono || ''}
                                    onChange={(e) => {
                                        const valorLimpio = e.target.value.replace(/\D/g, '');
                                        if (valorLimpio.length <= 9) {
                                            setUsuarioAEditar({ ...usuarioAEditar, telefono: valorLimpio });
                                        }
                                    }}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Rol en el Gimnasio</label>
                                <select
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white font-bold rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-all"
                                    value={usuarioAEditar.id_rol}
                                    onChange={(e) => setUsuarioAEditar({ ...usuarioAEditar, id_rol: Number(e.target.value) })}
                                >
                                    <option value={3}>Socio (Cliente)</option>
                                    <option value={2}>Monitor Deportivo</option>
                                    <option value={1}>Administrador</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-neutral-800 mt-auto">
                            <Button variant="ghost" className="flex-1" onClick={() => {
                                setUsuarioAEditar(null);
                                setError(null);
                            }}>
                                Cancelar
                            </Button>
                            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 font-bold" onClick={handleGuardarEdicion}>
                                Guardar Cambios
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CONTRATAR STAFF */}
            {isCreandoStaff && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-fitbox-card border border-neutral-800 p-8 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col my-8 relative">

                        <div className="border-b border-neutral-800 pb-4 mb-6">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                                Ficha de Nuevo Monitor
                            </h3>
                            <p className="text-sm text-fitbox-text-muted mt-1">Completa los datos contractuales y la especialidad del staff.</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg flex items-center gap-2 font-bold">
                                <AlertTriangle className="w-5 h-5 shrink-0" /> <p>{error}</p>
                            </div>
                        )}

                        {/* SUBIDA DE FOTO DE PERFIL */}
                        <div className="flex justify-center mb-6">
                            <label className="cursor-pointer relative group block">
                                <Avatar className="h-24 w-24 border-2 border-fitbox-red shadow-lg transition-opacity group-hover:opacity-50">
                                    {nuevoStaff.avatar_url && <AvatarImage src={nuevoStaff.avatar_url} className="object-cover" />}
                                    <AvatarFallback className="bg-neutral-900 text-fitbox-red font-bold">FOTO</AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

                            {/* ROL FIJO (Monitor) */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Puesto Asignado *</label>
                                <div className="w-full bg-neutral-900 border border-neutral-800 text-fitbox-red font-bold rounded-lg px-4 py-3 flex items-center">
                                    Monitor Deportivo
                                </div>
                            </div>

                            {/* ESPECIALIDAD (Disciplina) */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-fitbox-red uppercase tracking-widest">Especialidad *</label>
                                <select
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white font-bold rounded-lg px-4 py-3 outline-none focus:border-fitbox-red transition-all"
                                    value={nuevoStaff.id_disciplina}
                                    onChange={(e) => setNuevoStaff({ ...nuevoStaff, id_disciplina: e.target.value })}
                                >
                                    <option value="" disabled>Selecciona la disciplina principal...</option>
                                    {disciplinas.map((d) => (
                                        <option key={d.id_disciplina} value={d.id_disciplina}>
                                            {d.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* CREDENCIALES */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Correo Corporativo *</label>
                                <Input
                                    type="email"
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none focus:border-fitbox-red"
                                    placeholder="empleado@fitbox.com"
                                    value={nuevoStaff.email}
                                    onChange={(e) => setNuevoStaff({ ...nuevoStaff, email: e.target.value.replace(/\s/g, '') })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Contraseña Temporal *</label>
                                <Input
                                    type="password"
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none focus:border-fitbox-red"
                                    placeholder="Mínimo 6 caracteres..."
                                    value={nuevoStaff.password}
                                    onChange={(e) => setNuevoStaff({ ...nuevoStaff, password: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Confirmar Contraseña *</label>
                                <Input
                                    type="password"
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none focus:border-fitbox-red"
                                    placeholder="Repite la contraseña..."
                                    value={nuevoStaff.confirmPassword}
                                    onChange={(e) => setNuevoStaff({ ...nuevoStaff, confirmPassword: e.target.value })}
                                />
                            </div>

                            {/* DATOS PERSONALES */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nombre *</label>
                                <Input
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none focus:border-fitbox-red"
                                    placeholder="Ej: Carlos"
                                    value={nuevoStaff.nombre}
                                    onChange={(e) => setNuevoStaff({ ...nuevoStaff, nombre: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '') })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Apellidos *</label>
                                <Input
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none focus:border-fitbox-red"
                                    placeholder="Ej: Martínez Gómez"
                                    value={nuevoStaff.apellidos}
                                    onChange={(e) => setNuevoStaff({ ...nuevoStaff, apellidos: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '') })}
                                />
                            </div>

                            {/* --- INPUT DNI MODIFICADO --- */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">DNI *</label>
                                <Input
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none focus:border-fitbox-red uppercase font-mono tracking-widest"
                                    placeholder="Escribe 8 números"
                                    value={nuevoStaff.dni}
                                    maxLength={9}
                                    onChange={(e) => {
                                        const rawValue = e.target.value;
                                        
                                        if (rawValue.length < nuevoStaff.dni.length) {
                                            if (nuevoStaff.dni.length === 9) {
                                                setNuevoStaff({ ...nuevoStaff, dni: nuevoStaff.dni.substring(0, 7) });
                                            } else {
                                                setNuevoStaff({ ...nuevoStaff, dni: rawValue.replace(/\D/g, '') });
                                            }
                                            return;
                                        }

                                        const numeros = rawValue.replace(/\D/g, '').substring(0, 8);
                                        
                                        if (numeros.length === 8) {
                                            setNuevoStaff({ ...nuevoStaff, dni: numeros + calcularLetraDNI(numeros) });
                                        } else {
                                            setNuevoStaff({ ...nuevoStaff, dni: numeros });
                                        }
                                    }}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sexo</label>
                                <select
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none focus:border-fitbox-red transition-all capitalize"
                                    value={nuevoStaff.sexo}
                                    onChange={(e) => setNuevoStaff({ ...nuevoStaff, sexo: e.target.value })}
                                >
                                    <option value="" disabled>Seleccionar...</option>
                                    <option value="Hombre">Hombre</option>
                                    <option value="Mujer">Mujer</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Teléfono de Contacto</label>
                                <Input
                                    type="tel"
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none focus:border-fitbox-red"
                                    placeholder="Ej: 600123456"
                                    value={nuevoStaff.telefono}
                                    onChange={(e) => {
                                        const valorLimpio = e.target.value.replace(/\D/g, '');
                                        if (valorLimpio.length <= 9) {
                                            setNuevoStaff({ ...nuevoStaff, telefono: valorLimpio });
                                        }
                                    }}
                                />
                            </div>

                            {/* UBICACIÓN */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">País</label>
                                <Input
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none focus:border-fitbox-red"
                                    placeholder="Ej: España"
                                    value={nuevoStaff.pais}
                                    onChange={(e) => setNuevoStaff({ ...nuevoStaff, pais: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '') })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Provincia</label>
                                <Input
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none focus:border-fitbox-red"
                                    placeholder="Ej: Madrid"
                                    value={nuevoStaff.provincia}
                                    onChange={(e) => setNuevoStaff({ ...nuevoStaff, provincia: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '') })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Localidad / Ciudad</label>
                                <Input
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none focus:border-fitbox-red"
                                    placeholder="Ej: Móstoles"
                                    value={nuevoStaff.localidad}
                                    onChange={(e) => setNuevoStaff({ ...nuevoStaff, localidad: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '') })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Código Postal</label>
                                <Input
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none focus:border-fitbox-red"
                                    placeholder="Ej: 28930"
                                    value={nuevoStaff.codigo_postal}
                                    onChange={(e) => {
                                        const valorLimpio = e.target.value.replace(/\D/g, '');
                                        if (valorLimpio.length <= 5) {
                                            setNuevoStaff({ ...nuevoStaff, codigo_postal: valorLimpio });
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-neutral-800 mt-auto">
                            <Button variant="ghost" className="flex-1" onClick={() => {
                                setIsCreandoStaff(false);
                                setError(null);
                            }}>
                                Cancelar
                            </Button>
                            <Button className="flex-1 bg-fitbox-red hover:bg-red-700 font-bold" disabled={isRegistering} onClick={handleContratarStaff}>
                                {isRegistering ? 'Procesando...' : 'Registrar Empleado'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};