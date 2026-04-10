import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { MachineRepository, type EstadoMaquina, type Maquina } from '../database/repositories/MachineRepository';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Dumbbell, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export const MaquinasPage = () => {
    // 1. Sacamos los datos del usuario que ha iniciado sesión
    const profile = useAuthStore((state) => state.profile);
    const rol = profile?.roles?.nombre_rol || 'Socio';
    const idUsuario = profile?.id_usuario;

    // 2. Variables para guardar nuestras máquinas y controlar si está cargando
    const [maquinas, setMaquinas] = useState<Maquina[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 3. Variables para la ventanita de "Cambiar Estado"
    const [maquinaSeleccionada, setMaquinaSeleccionada] = useState<Maquina | null>(null);
    const [nuevoEstado, setNuevoEstado] = useState<EstadoMaquina>('Correcto');
    const [nuevasObservaciones, setNuevasObservaciones] = useState('');

    // 4. Variables para la ventanita de "Añadir Máquina" (Solo Admin)
    const [isCreando, setIsCreando] = useState(false);
    const [nombreNuevaMaquina, setNombreNuevaMaquina] = useState('');

    // Función que se ejecuta nada más abrir la página para traer las máquinas
    const cargarMaquinas = async () => {
        try {
            setIsLoading(true);
            const data = await MachineRepository.getAllMaquinas();
            setMaquinas(data);
        } catch (err) {
            console.error(err);
            setError('Fallo al cargar las máquinas');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Solo cargamos si NO es socio
        if (rol !== 'Socio') {
            cargarMaquinas();
        }
    }, [rol]);

    // Función para guardar el cambio de estado
    const handleActualizarEstado = async () => {
        if (!maquinaSeleccionada || !idUsuario) return;

        try {
            await MachineRepository.updateEstado(
                maquinaSeleccionada.id_maquina,
                nuevoEstado,
                nuevasObservaciones,
                idUsuario
            );
            // Cerramos la ventanita y recargamos la tabla
            setMaquinaSeleccionada(null);
            cargarMaquinas();
        } catch (err) {
            console.error(err);
            setError('No se pudo actualizar el estado');
        }
    };

    // Función para que el Admin cree una máquina
    const handleCrearMaquina = async () => {
        if (!nombreNuevaMaquina.trim()) return;

        try {
            await MachineRepository.createMaquina(nombreNuevaMaquina);
            setIsCreando(false);
            setNombreNuevaMaquina('');
            cargarMaquinas(); // Recargamos para verla en la lista
        } catch (err) {
            console.error(err);
            setError('Error al crear la máquina');
        }
    };

    // --- BLOQUEO DE SEGURIDAD JUNIOR ---
    // Si un socio intenta entrar poniendo la URL a mano, le mostramos esto y no le enseñamos nada.
    if (rol === 'Socio') {
        return (
            <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <p>Acceso denegado. Esta sección es solo para el Staff (Monitores y Administradores).</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">

            {/* Cabecera de la página */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-fitbox-text flex items-center gap-2">
                        <Dumbbell className="w-6 h-6 text-fitbox-red" />
                        Inventario de Máquinas
                    </h1>
                    <p className="text-fitbox-text-muted mt-1">Control de averías y mantenimiento</p>
                </div>

                {/* Solo el Admin ve el botón de crear máquina */}
                {rol === 'Administrador' && (
                    <Button onClick={() => setIsCreando(true)}>+ Añadir Máquina</Button>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    <p>{error}</p>
                </div>
            )}

            {/* La tabla de máquinas */}
            <div className="bg-fitbox-card border border-neutral-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-fitbox-text">
                        <thead className="bg-neutral-800/50 text-fitbox-text-muted uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Máquina</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4">Última Avería</th>
                                <th className="px-6 py-4">Observaciones</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {isLoading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center">Cargando inventario...</td></tr>
                            ) : maquinas.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center">No hay máquinas registradas.</td></tr>
                            ) : (
                                maquinas.map((maq) => (
                                    <tr key={maq.id_maquina} className="hover:bg-neutral-800/20 transition-colors">
                                        <td className="px-6 py-4 font-medium">{maq.nombre}</td>
                                        <td className="px-6 py-4">
                                            {/* Pintamos los cartelitos de colores según el estado */}
                                            {maq.estado === 'Correcto' && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                                                    <CheckCircle className="w-3.5 h-3.5" /> Correcto
                                                </span>
                                            )}
                                            {maq.estado === 'Defectuoso' && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
                                                    <AlertTriangle className="w-3.5 h-3.5" /> Defectuoso
                                                </span>
                                            )}
                                            {maq.estado === 'Correcto pero con observaciones' && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500">
                                                    <Info className="w-3.5 h-3.5" /> Con observaciones
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-fitbox-text-muted">
                                            {maq.fecha_averia ? new Date(maq.fecha_averia).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-fitbox-text-muted max-w-xs truncate">
                                            {maq.observaciones || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {/* Botón que abre la ventanita para actualizar */}
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    setMaquinaSeleccionada(maq);
                                                    setNuevoEstado(maq.estado);
                                                    setNuevasObservaciones(maq.observaciones || '');
                                                }}
                                            >
                                                Actualizar
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* VENTANITA (MODAL): Para cambiar el estado de la máquina */}
            {maquinaSeleccionada && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
                    <div className="bg-fitbox-card border border-neutral-800 p-6 rounded-lg w-full max-w-md space-y-4">
                        <h3 className="text-xl font-bold">Reportar estado: {maquinaSeleccionada.nombre}</h3>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-fitbox-text-muted">Estado de la máquina</label>
                            {/* El desplegable que pidió el profe */}
                            <select
                                className="w-full bg-neutral-900 border border-neutral-700 text-fitbox-text rounded-md px-3 py-2"
                                value={nuevoEstado}
                                onChange={(e) => setNuevoEstado(e.target.value as EstadoMaquina)}
                            >
                                <option value="Correcto">Correcto</option>
                                <option value="Defectuoso">Defectuoso (Avería)</option>
                                <option value="Correcto pero con observaciones">Correcto pero con observaciones</option>
                            </select>
                        </div>

                        {/* Solo mostramos la caja de texto si hay que poner observaciones */}
                        {nuevoEstado !== 'Correcto' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-fitbox-text-muted">Observaciones / Detalles</label>
                                <textarea
                                    className="w-full bg-neutral-900 border border-neutral-700 text-fitbox-text rounded-md px-3 py-2 min-h-25"
                                    placeholder="Describe qué le pasa a la máquina..."
                                    value={nuevasObservaciones}
                                    onChange={(e) => setNuevasObservaciones(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="flex gap-3 justify-end mt-6">
                            <Button variant="ghost" onClick={() => setMaquinaSeleccionada(null)}>Cancelar</Button>
                            <Button onClick={handleActualizarEstado}>Guardar Cambios</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* VENTANITA (MODAL): Para crear máquina nueva (Admin) */}
            {isCreando && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
                    <div className="bg-fitbox-card border border-neutral-800 p-6 rounded-lg w-full max-w-md space-y-4">
                        <h3 className="text-xl font-bold">Añadir nueva máquina</h3>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-fitbox-text-muted">Nombre o modelo de la máquina</label>
                            <Input
                                placeholder="Ej: Cinta de correr 2"
                                value={nombreNuevaMaquina}
                                onChange={(e) => setNombreNuevaMaquina(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3 justify-end mt-6">
                            <Button variant="ghost" onClick={() => setIsCreando(false)}>Cancelar</Button>
                            <Button onClick={handleCrearMaquina}>Añadir</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};