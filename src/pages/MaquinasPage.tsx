import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { MachineRepository, type EstadoMaquina, type Maquina } from '../database/repositories/MachineRepository';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Dumbbell, AlertTriangle, CheckCircle, Info, Trash2 } from 'lucide-react'; // Añadido Trash2

export const MaquinasPage = () => {
    // 1. Sacamos los datos del usuario que ha iniciado sesión
    const profile = useAuthStore((state) => state.profile);
    const rol = profile?.roles?.nombre_rol || 'Socio';
    const isAdmin = rol === 'Administrador';
    const idUsuario = profile?.id_usuario;

    // 2. Variables para guardar nuestras máquinas y controlar si está cargando
    const [maquinas, setMaquinas] = useState<Maquina[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // 3. Variables para la ventanita de "Cambiar Estado"
    const [maquinaSeleccionada, setMaquinaSeleccionada] = useState<Maquina | null>(null);
    const [nuevoEstado, setNuevoEstado] = useState<EstadoMaquina>('Correcto');
    const [nuevasObservaciones, setNuevasObservaciones] = useState('');

    // 4. Variables para la ventanita de "Añadir Máquina" (Solo Admin)
    const [isCreando, setIsCreando] = useState(false);
    const [nombreNuevaMaquina, setNombreNuevaMaquina] = useState('');

    // Función que se ejecuta nada más abrir la página para traer las máquinas
    const cargarMaquinas = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await MachineRepository.getAllMaquinas();
            setMaquinas(data);
        } catch (errorCatch) {
            console.error("Error al cargar máquinas:", errorCatch);
            setError('Fallo al cargar el inventario');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // Solo cargamos si NO es socio
        if (rol !== 'Socio') {
            cargarMaquinas();
        }
    }, [rol, cargarMaquinas]);

    // Función para guardar el cambio de estado
    const handleActualizarEstado = async () => {
        if (!maquinaSeleccionada || !idUsuario) return;
        setError(null);
        setSuccessMessage(null);

        try {
            await MachineRepository.updateEstado(
                maquinaSeleccionada.id_maquina,
                nuevoEstado,
                nuevasObservaciones,
                idUsuario
            );
            // Cerramos la ventanita y recargamos la tabla
            setMaquinaSeleccionada(null);
            setSuccessMessage("Estado actualizado correctamente");
            cargarMaquinas();
        } catch (errorCatch) {
            console.error("Error al actualizar:", errorCatch);
            if (errorCatch instanceof Error) setError(errorCatch.message);
            else setError('No se pudo actualizar el estado');
        }
    };

    // Función para que el Admin cree una máquina
    const handleCrearMaquina = async () => {
        if (!nombreNuevaMaquina.trim()) return;
        setError(null);
        setSuccessMessage(null);

        try {
            await MachineRepository.createMaquina(nombreNuevaMaquina);
            setIsCreando(false);
            setNombreNuevaMaquina('');
            setSuccessMessage("Máquina añadida al inventario");
            cargarMaquinas(); // Recargamos para verla en la lista
        } catch (errorCatch) {
            console.error("Error al crear:", errorCatch);
            if (errorCatch instanceof Error) setError(errorCatch.message);
            else setError('Error al crear la máquina');
        }
    };

    // NUEVO: Función para dar de baja la máquina (Solo Admin)
    const handleBorrarMaquina = async (id_maquina: string) => {
        if (!window.confirm("¿Seguro que quieres borrar definitivamente esta máquina del gimnasio?")) return;
        setError(null);
        setSuccessMessage(null);

        try {
            await MachineRepository.deleteMaquina(id_maquina);
            setSuccessMessage("Máquina eliminada correctamente");
            cargarMaquinas();
        } catch (errorCatch) {
            console.error("Error al borrar:", errorCatch);
            if (errorCatch instanceof Error) setError(errorCatch.message);
            else setError('Error al intentar borrar la máquina');
        }
    };

    // --- BLOQUEO DE SEGURIDAD JUNIOR ---
    // Si un socio intenta entrar poniendo la URL a mano, le mostramos esto y no le enseñamos nada.
    if (rol === 'Socio') {
        return (
            <div className="p-8 text-center">
                <div className="inline-block p-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg font-bold">
                    <AlertTriangle className="w-6 h-6 inline-block mb-1 mr-2" />
                    Acceso denegado. Inventario exclusivo para Monitores y Administradores.
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">

            {/* Cabecera de la página */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white flex items-center gap-3 uppercase tracking-tight">
                        <Dumbbell className="w-8 h-8 text-fitbox-red" />
                        INVENTARIO DE <span className="text-fitbox-red">MÁQUINAS</span>
                    </h1>
                    <p className="text-fitbox-text-muted mt-1">Control, averías y mantenimiento del gimnasio</p>
                </div>

                {/* Solo el Admin ve el botón de crear máquina */}
                {isAdmin && (
                    <Button onClick={() => setIsCreando(true)} className="bg-fitbox-red hover:bg-red-700 font-bold">
                        + Añadir Máquina
                    </Button>
                )}
            </div>

            {/* Mensajes de Alerta y Éxito */}
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

            {/* La tabla de máquinas */}
            <div className="bg-fitbox-card border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-800/50 text-fitbox-text-muted uppercase text-[10px] tracking-widest font-bold">
                            <tr>
                                <th className="px-6 py-4">Equipamiento</th>
                                <th className="px-6 py-4">Estado Actual</th>
                                <th className="px-6 py-4">Última Avería</th>
                                <th className="px-6 py-4">Observaciones / Detalles</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {isLoading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Cargando inventario...</td></tr>
                            ) : maquinas.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">El gimnasio no tiene máquinas registradas.</td></tr>
                            ) : (
                                maquinas.map((maq) => {
                                    // Variables de limpieza visual
                                    const esCorrecto = maq.estado === 'Correcto';
                                    const esDefectuoso = maq.estado === 'Defectuoso';
                                    const esObs = maq.estado === 'Correcto pero con observaciones';

                                    return (
                                        <tr key={maq.id_maquina} className={`hover:bg-neutral-800/20 transition-colors ${esDefectuoso ? 'bg-red-900/5' : ''}`}>
                                            <td className="px-6 py-4 font-bold text-white text-base">{maq.nombre}</td>
                                            <td className="px-6 py-4">
                                                {/* Cartelitos de Estado Visuales */}
                                                {esCorrecto && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-green-500/10 text-green-500 border border-green-500/20">
                                                        <CheckCircle className="w-3.5 h-3.5" /> CORRECTO
                                                    </span>
                                                )}
                                                {esDefectuoso && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-red-500/10 text-red-500 border border-red-500/20">
                                                        <AlertTriangle className="w-3.5 h-3.5" /> DEFECTUOSO
                                                    </span>
                                                )}
                                                {esObs && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                                        <Info className="w-3.5 h-3.5" /> OBSERVACIONES
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-fitbox-text-muted font-medium">
                                                {maq.fecha_averia ? new Date(maq.fecha_averia).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-6 py-4 max-w-xs">
                                                {(!esCorrecto && maq.observaciones) ? (
                                                    <p className={`text-sm italic ${esDefectuoso ? 'text-red-400' : 'text-yellow-400'}`}>
                                                        "{maq.observaciones}"
                                                    </p>
                                                ) : (
                                                    <span className="text-gray-600 text-xs">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {/* Botón que abre la ventanita para actualizar */}
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="font-bold text-[11px] uppercase tracking-tighter mr-2"
                                                    onClick={() => {
                                                        setMaquinaSeleccionada(maq);
                                                        setNuevoEstado(maq.estado);
                                                        setNuevasObservaciones(maq.observaciones || '');
                                                    }}
                                                >
                                                    Reportar
                                                </Button>

                                                {/* NUEVO: Botón de borrar (Solo Admin) */}
                                                {isAdmin && (
                                                    <button onClick={() => handleBorrarMaquina(maq.id_maquina)} className="text-red-500 hover:text-red-400 p-1 transition-colors">
                                                        <Trash2 className="w-5 h-5 inline" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* VENTANITA (MODAL): Para cambiar el estado de la máquina */}
            {maquinaSeleccionada && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-fitbox-card border border-neutral-800 p-8 rounded-2xl w-full max-w-md space-y-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-white border-b border-neutral-800 pb-2">
                            Actualizar: <span className="text-fitbox-red">{maquinaSeleccionada.nombre}</span>
                        </h3>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Estado Actual</label>
                            {/* El desplegable que pidió el profe */}
                            <select
                                className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-lg px-4 py-3 outline-none focus:border-fitbox-red"
                                value={nuevoEstado}
                                onChange={(e) => setNuevoEstado(e.target.value as EstadoMaquina)}
                            >
                                <option value="Correcto">✅ Correcto (Operativa)</option>
                                <option value="Defectuoso">❌ Defectuoso (Avería)</option>
                                <option value="Correcto pero con observaciones">⚠️ Correcto pero con observaciones</option>
                            </select>
                        </div>

                        {/* Solo mostramos la caja de texto si hay que poner observaciones */}
                        {nuevoEstado !== 'Correcto' && (
                            <div className="space-y-2 animate-in slide-in-from-top-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Observaciones / Detalles</label>
                                <textarea
                                    className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-lg px-4 py-3 outline-none min-h-[100px] resize-none focus:border-fitbox-red"
                                    placeholder="Describe qué le pasa a la máquina..."
                                    value={nuevasObservaciones}
                                    onChange={(e) => setNuevasObservaciones(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            <Button variant="ghost" className="flex-1" onClick={() => setMaquinaSeleccionada(null)}>Cancelar</Button>
                            <Button className="flex-1 bg-fitbox-red hover:bg-red-700" onClick={handleActualizarEstado}>Guardar Cambios</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* VENTANITA (MODAL): Para crear máquina nueva (Admin) */}
            {isCreando && isAdmin && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-fitbox-card border border-neutral-800 p-8 rounded-2xl w-full max-w-sm space-y-6 shadow-2xl">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight border-b border-neutral-800 pb-2">
                            Nueva Máquina
                        </h3>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nombre o modelo</label>
                            <Input
                                autoFocus
                                className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none focus:border-fitbox-red transition-colors"
                                placeholder="Ej: Cinta de correr 2"
                                value={nombreNuevaMaquina}
                                onChange={(e) => setNombreNuevaMaquina(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-4 pt-2">
                            <Button variant="ghost" className="flex-1" onClick={() => setIsCreando(false)}>Cancelar</Button>
                            <Button className="flex-1 bg-fitbox-red hover:bg-red-700" onClick={handleCrearMaquina}>Añadir</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};