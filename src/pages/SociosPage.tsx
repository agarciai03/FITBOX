import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { UserRepository, type Usuario } from '../database/repositories/UserRepository';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Users, Shield, UserCheck, AlertTriangle, UserPlus, CheckCircle, Trash2, Edit2 } from 'lucide-react'; 

export const SociosPage = () => {
    // 1. Variables de Sesión
    const profile = useAuthStore((state) => state.profile);
    const rol = profile?.roles?.nombre_rol || 'Socio';
    const isAdmin = rol === 'Administrador';

    // 2. Estado de los Datos
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // 3. Modal Añadir Staff
    const [isCreandoStaff, setIsCreandoStaff] = useState(false);
    const [nuevoStaff, setNuevoStaff] = useState({
        nombre: '',
        apellidos: '',
        dni: '',
        telefono: '',
        email: '',
        id_rol: 2 // Por defecto 2 (Monitor)
    });

    // Modal Editar Usuario
    const [usuarioAEditar, setUsuarioAEditar] = useState<Usuario | null>(null);

    // Cargar la lista de la base de datos
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

    useEffect(() => {
        if (isAdmin) {
            cargarUsuarios();
        }
    }, [isAdmin, cargarUsuarios]);

    // Función: Añadir Staff
    const handleContratarStaff = async () => {
        if (!nuevoStaff.nombre || !nuevoStaff.apellidos || !nuevoStaff.dni || !nuevoStaff.email) {
            setError("Por favor, rellena los campos obligatorios (Nombre, Apellidos, DNI y Correo).");
            return;
        }

        setError(null);
        setSuccessMessage(null);

        const nuevoUsuarioParaLaTabla: Usuario = {
            id_usuario: Math.random().toString(36).substring(2, 11),
            nombre: nuevoStaff.nombre,
            apellidos: nuevoStaff.apellidos,
            email: nuevoStaff.email,
            id_rol: nuevoStaff.id_rol,
            telefono: nuevoStaff.telefono || "Sin teléfono",
            roles: {
                nombre_rol: nuevoStaff.id_rol === 1 ? 'Administrador' : 'Monitor'
            }
        };

        setTimeout(() => {
            setUsuarios([nuevoUsuarioParaLaTabla, ...usuarios]);
            setSuccessMessage(`¡Ficha de ${nuevoStaff.nombre} ${nuevoStaff.apellidos} creada correctamente!`);
            setIsCreandoStaff(false);
            setNuevoStaff({ nombre: '', apellidos: '', dni: '', telefono: '', email: '', id_rol: 2 });
        }, 1000);
    };

    // Función: Dar de baja a un usuario
    const handleBorrarUsuario = async (id_usuario: string, nombre: string) => {
        if (!window.confirm(`¿Seguro que quieres dar de baja a ${nombre} definitivamente? Esta acción no se puede deshacer.`)) return;

        setError(null);
        setSuccessMessage(null);

        try {
            await UserRepository.deleteUser(id_usuario);
            setSuccessMessage(`El usuario ${nombre} ha sido eliminado del sistema.`);
            cargarUsuarios(); // Recargamos la tabla para que desaparezca
        } catch (errorCatch) {
            console.error("Error al borrar usuario:", errorCatch);
            if (errorCatch instanceof Error) setError(errorCatch.message);
            else setError("Error al intentar borrar el usuario de la base de datos.");
        }
    };

    // Función para guardar los cambios al editar un usuario
    const handleGuardarEdicion = async () => {
        if (!usuarioAEditar) return;

        // Validación básica
        if (!usuarioAEditar.nombre || !usuarioAEditar.apellidos) {
            setError("El nombre y los apellidos no pueden estar vacíos.");
            return;
        }

        setError(null);
        setSuccessMessage(null);

        try {
            // Solo enviamos los datos que se pueden modificar (no el email o el id)
            await UserRepository.updateUser(usuarioAEditar.id_usuario, {
                nombre: usuarioAEditar.nombre,
                apellidos: usuarioAEditar.apellidos,
                telefono: usuarioAEditar.telefono,
                id_rol: usuarioAEditar.id_rol
            });

            setSuccessMessage(`Datos de ${usuarioAEditar.nombre} actualizados correctamente.`);
            setUsuarioAEditar(null); // Cerramos el modal
            cargarUsuarios(); // Refrescamos la tabla para ver los cambios
        } catch (errorCatch) {
            console.error("Error al actualizar usuario:", errorCatch);
            if (errorCatch instanceof Error) setError(errorCatch.message);
            else setError("Error al intentar actualizar la base de datos.");
        }
    };

    // Bloqueo de Seguridad
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

                <Button onClick={() => setIsCreandoStaff(true)} className="bg-fitbox-red hover:bg-red-700 font-bold">
                    <UserPlus className="w-4 h-4 mr-2" /> Contratar Staff
                </Button>
            </div>

            {/* ALERTAS */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg flex items-center gap-2 font-bold">
                    <AlertTriangle className="w-5 h-5" /> <p>{error}</p>
                </div>
            )}
            {successMessage && (
                <div className="p-4 bg-green-500/10 border border-green-500/50 text-green-500 rounded-lg flex items-center gap-2 font-bold">
                    <CheckCircle className="w-5 h-5" /> <p>{successMessage}</p>
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
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                        <UserCheck className="w-3.5 h-3.5" /> STAFF / MONITOR
                                                    </span>
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
                                                        onClick={() => setUsuarioAEditar(user)}
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
                    <div className="bg-fitbox-card border border-neutral-800 p-8 rounded-2xl w-full max-w-lg space-y-6 shadow-2xl">
                        <div className="border-b border-neutral-800 pb-4">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">
                                Editar Ficha: <span className="text-blue-400">{usuarioAEditar.nombre}</span>
                            </h3>
                            <p className="text-sm text-fitbox-text-muted mt-1">
                                {usuarioAEditar.email} {/* Mostramos el email pero no dejamos editarlo por seguridad */}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nombre</label>
                                <Input
                                    autoFocus
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                                    value={usuarioAEditar.nombre}
                                    onChange={(e) => setUsuarioAEditar({ ...usuarioAEditar, nombre: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Apellidos</label>
                                <Input
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                                    value={usuarioAEditar.apellidos}
                                    onChange={(e) => setUsuarioAEditar({ ...usuarioAEditar, apellidos: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Teléfono</label>
                                <Input
                                    type="tel"
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                                    value={usuarioAEditar.telefono || ''}
                                    onChange={(e) => setUsuarioAEditar({ ...usuarioAEditar, telefono: e.target.value })}
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

                        <div className="flex gap-4 pt-4 border-t border-neutral-800">
                            <Button variant="ghost" className="flex-1" onClick={() => setUsuarioAEditar(null)}>
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
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-fitbox-card border border-neutral-800 p-8 rounded-2xl w-full max-w-2xl space-y-6 shadow-2xl">
                        <div className="border-b border-neutral-800 pb-4">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                                Ficha de Nuevo Empleado
                            </h3>
                            <p className="text-sm text-fitbox-text-muted mt-1">Completa los datos contractuales del nuevo staff.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Puesto Asignado *</label>
                                <select
                                    className="w-full bg-neutral-900 border border-neutral-800 text-blue-400 font-bold rounded-lg px-4 py-3 outline-none focus:border-fitbox-red transition-all"
                                    value={nuevoStaff.id_rol}
                                    onChange={(e) => setNuevoStaff({ ...nuevoStaff, id_rol: Number(e.target.value) })}
                                >
                                    <option value={2}>Monitor Deportivo</option>
                                    <option value={1}>Co-Administrador (Dirección)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nombre *</label>
                                <Input
                                    autoFocus
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none focus:border-fitbox-red"
                                    placeholder="Ej: Carlos"
                                    value={nuevoStaff.nombre}
                                    onChange={(e) => setNuevoStaff({ ...nuevoStaff, nombre: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Apellidos *</label>
                                <Input
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none focus:border-fitbox-red"
                                    placeholder="Ej: Martínez Gómez"
                                    value={nuevoStaff.apellidos}
                                    onChange={(e) => setNuevoStaff({ ...nuevoStaff, apellidos: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">DNI / NIE *</label>
                                <Input
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none focus:border-fitbox-red uppercase"
                                    placeholder="12345678X"
                                    value={nuevoStaff.dni}
                                    onChange={(e) => setNuevoStaff({ ...nuevoStaff, dni: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Teléfono de Contacto</label>
                                <Input
                                    type="tel"
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none focus:border-fitbox-red"
                                    placeholder="600 000 000"
                                    value={nuevoStaff.telefono}
                                    onChange={(e) => setNuevoStaff({ ...nuevoStaff, telefono: e.target.value })}
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Correo Corporativo *</label>
                                <Input
                                    type="email"
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none focus:border-fitbox-red"
                                    placeholder="carlos.martinez@fitbox.com"
                                    value={nuevoStaff.email}
                                    onChange={(e) => setNuevoStaff({ ...nuevoStaff, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-neutral-800">
                            <Button variant="ghost" className="flex-1" onClick={() => {
                                setIsCreandoStaff(false);
                                setError(null);
                            }}>
                                Cancelar
                            </Button>
                            <Button className="flex-1 bg-fitbox-red hover:bg-red-700 font-bold" onClick={handleContratarStaff}>
                                Registrar Empleado
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};