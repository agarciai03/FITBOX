import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { MachineRepository, type EstadoMaquina, type Maquina } from '../database/repositories/MachineRepository';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Dumbbell, AlertTriangle, CheckCircle, Info, Trash2, ExternalLink, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

// Función inteligente para clasificar las máquinas según su nombre
const getCategoria = (nombre: string): string => {
    const n = nombre.toLowerCase();
    if (['saco', 'aqua bag', 'pera', 'bob', 'ring', 'escudos', 'manoplas', 'combas', 'espejos', 'asaltos'].some(k => n.includes(k))) return 'Boxeo';
    if (['tatami', 'dummy grappling', 'wall pad', 'cuerda de trepar', 'crash mat', 'foam roller', 'bandas', 'fitball', 'fat grip', 'sparring'].some(k => n.includes(k))) return 'Jiu Jitsu BJJ';
    if (['rig', 'anillas', 'remo', 'skierg', 'assault', 'ghd', 'olímpic', 'bumpers', 'cajon', 'kettlebell', 'wall ball', 'pegboard', 'trineo', 'césped'].some(k => n.includes(k))) return 'CrossFit';
    return 'Sala de Máquinas';
};

const CATEGORIAS = ['Sala de Máquinas', 'Boxeo', 'Jiu Jitsu BJJ', 'CrossFit'];

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

    // Estado para controlar qué desplegable está abierto
    const [seccionesAbiertas, setSeccionesAbiertas] = useState<Record<string, boolean>>({
        'Sala de Máquinas': true,
        'Boxeo': false,
        'Jiu Jitsu BJJ': false,
        'CrossFit': false
    });

    const toggleSeccion = (categoria: string) => {
        setSeccionesAbiertas(prev => ({ ...prev, [categoria]: !prev[categoria] }));
    };

    // 3. Variables para la ventanita de "Cambiar Estado"
    const [maquinaSeleccionada, setMaquinaSeleccionada] = useState<Maquina | null>(null);
    const [nuevoEstado, setNuevoEstado] = useState<EstadoMaquina>('Correcto');
    const [nuevasObservaciones, setNuevasObservaciones] = useState('');

    // 4. Variables para la ventanita de "Añadir Máquina" (Solo Admin)
    const [isCreando, setIsCreando] = useState(false);
    const [nombreNuevaMaquina, setNombreNuevaMaquina] = useState('');
    const [descripcionNuevaMaquina, setDescripcionNuevaMaquina] = useState('');
    const [tutorialNuevaMaquina, setTutorialNuevaMaquina] = useState('');

    // 5. Variable para la ventanita de "Ver Instrucciones"
    const [maquinaParaLeer, setMaquinaParaLeer] = useState<Maquina | null>(null);

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
            await MachineRepository.createMaquina(nombreNuevaMaquina, descripcionNuevaMaquina, tutorialNuevaMaquina);
            setIsCreando(false);
            setNombreNuevaMaquina('');
            setDescripcionNuevaMaquina('');
            setTutorialNuevaMaquina('');
            setSuccessMessage("Máquina añadida al inventario");
            cargarMaquinas();
        } catch (errorCatch) {
            console.error("Error al crear:", errorCatch);
            if (errorCatch instanceof Error) setError(errorCatch.message);
            else setError('Error al crear la máquina');
        }
    };

    // Función para dar de baja la máquina (Solo Admin)
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
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">

            {/* Cabecera de la página */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white flex items-center gap-3 uppercase tracking-tight">
                        <Dumbbell className="w-8 h-8 text-fitbox-red" />
                        INVENTARIO DE <span className="text-fitbox-red">MÁQUINAS</span>
                    </h1>
                    <p className="text-fitbox-text-muted mt-1">Control, averías y mantenimiento del gimnasio</p>
                </div>

                {isAdmin && (
                    <Button onClick={() => setIsCreando(true)} className="bg-fitbox-red hover:bg-red-700 font-bold shadow-lg shadow-fitbox-red/20">
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

            {/* CONTENIDO PRINCIPAL: ACORDEONES POR DISCIPLINA */}
            {isLoading ? (
                <div className="p-12 text-center text-gray-500 bg-fitbox-card border border-neutral-800 rounded-xl">Cargando inventario...</div>
            ) : maquinas.length === 0 ? (
                <div className="p-12 text-center text-gray-500 bg-fitbox-card border border-neutral-800 rounded-xl">El gimnasio no tiene máquinas registradas.</div>
            ) : (
                <div className="space-y-4">
                    {CATEGORIAS.map((categoria) => {
                        // Filtramos las máquinas que pertenecen a esta categoría
                        const maquinasCategoria = maquinas.filter(m => getCategoria(m.nombre) === categoria);
                        if (maquinasCategoria.length === 0) return null; // Si no hay máquinas de esto, no mostramos el bloque

                        const isOpen = seccionesAbiertas[categoria];

                        return (
                            <div key={categoria} className="bg-fitbox-card border border-neutral-800 rounded-xl overflow-hidden shadow-xl transition-all">
                                {/* BOTÓN DESPLEGABLE */}
                                <button
                                    onClick={() => toggleSeccion(categoria)}
                                    className="w-full flex items-center justify-between p-5 bg-neutral-900/80 hover:bg-neutral-800 transition-colors focus:outline-none"
                                >
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-lg font-black text-white uppercase tracking-tight">{categoria}</h2>
                                        <span className="bg-fitbox-red/10 text-fitbox-red border border-fitbox-red/20 px-2 py-0.5 rounded-full text-xs font-bold">
                                            {maquinasCategoria.length} equipos
                                        </span>
                                    </div>
                                    {isOpen ? <ChevronUp className="w-5 h-5 text-fitbox-red" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                                </button>

                                {/* TABLA (Solo se muestra si isOpen es true) */}
                                {isOpen && (
                                    <div className="overflow-x-auto border-t border-neutral-800">
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
                                                {maquinasCategoria.map((maq) => {
                                                    const esCorrecto = maq.estado === 'Correcto';
                                                    const esDefectuoso = maq.estado === 'Defectuoso';
                                                    const esObs = maq.estado === 'Correcto pero con observaciones';

                                                    return (
                                                        <tr key={maq.id_maquina} className={`hover:bg-neutral-800/20 transition-colors ${esDefectuoso ? 'bg-red-900/5' : ''}`}>
                                                            <td className="px-6 py-4 font-bold text-white text-base flex items-center gap-2">
                                                                {maq.nombre}
                                                                {(maq.descripcion || maq.tutorial_url) && (
                                                                    <span className="text-blue-400" title="Contiene instrucciones de uso">
                                                                        <BookOpen className="w-4 h-4" />
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4">
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
                                                                <div className="flex items-center justify-end gap-2">
                                                                    {(maq.descripcion || maq.tutorial_url) && (
                                                                        <Button
                                                                            variant="secondary"
                                                                            size="sm"
                                                                            className="font-bold text-[11px] uppercase tracking-tighter bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20"
                                                                            onClick={() => setMaquinaParaLeer(maq)}
                                                                        >
                                                                            <BookOpen className="w-3.5 h-3.5 mr-1.5 inline" /> Info
                                                                        </Button>
                                                                    )}

                                                                    <Button
                                                                        variant="secondary"
                                                                        size="sm"
                                                                        className="font-bold text-[11px] uppercase tracking-tighter"
                                                                        onClick={() => {
                                                                            setMaquinaSeleccionada(maq);
                                                                            setNuevoEstado(maq.estado);
                                                                            setNuevasObservaciones(maq.observaciones || '');
                                                                        }}
                                                                    >
                                                                        Reportar
                                                                    </Button>

                                                                    {isAdmin && (
                                                                        <button onClick={() => handleBorrarMaquina(maq.id_maquina)} className="text-red-500 hover:text-red-400 p-1.5 rounded-md hover:bg-red-500/10 transition-colors ml-1">
                                                                            <Trash2 className="w-4 h-4 inline" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* NUEVA VENTANITA (MODAL): Ver Instrucciones de la Máquina */}
            {maquinaParaLeer && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-fitbox-card border border-neutral-800 p-8 rounded-2xl w-full max-w-lg space-y-6 shadow-2xl">
                        <div className="border-b border-neutral-800 pb-4">
                            <h3 className="text-2xl font-black text-white uppercase italic flex items-center gap-2">
                                <Dumbbell className="text-blue-400" /> {maquinaParaLeer.nombre}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Manual de uso</p>
                        </div>

                        {maquinaParaLeer.descripcion && (
                            <div className="text-gray-300 leading-relaxed text-sm bg-neutral-900/50 p-4 rounded-lg border border-neutral-800">
                                {maquinaParaLeer.descripcion}
                            </div>
                        )}

                        {maquinaParaLeer.tutorial_url && (
                            <a href={maquinaParaLeer.tutorial_url} target="_blank" rel="noreferrer" className="block">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
                                    <ExternalLink className="w-4 h-4 mr-2" /> Ver Vídeo Tutorial
                                </Button>
                            </a>
                        )}

                        <div className="pt-2">
                            <Button variant="secondary" className="w-full" onClick={() => setMaquinaParaLeer(null)}>Cerrar</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* VENTANITA (MODAL): Para cambiar el estado de la máquina */}
            {maquinaSeleccionada && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-fitbox-card border border-neutral-800 p-8 rounded-2xl w-full max-w-md space-y-6 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                        <h3 className="text-xl font-bold text-white border-b border-neutral-800 pb-2">
                            Actualizar: <span className="text-fitbox-red">{maquinaSeleccionada.nombre}</span>
                        </h3>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Estado Actual</label>
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

                        {nuevoEstado !== 'Correcto' && (
                            <div className="space-y-2 animate-in slide-in-from-top-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Observaciones / Detalles</label>
                                <textarea
                                    className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-lg px-4 py-3 outline-none min-h-25 resize-none focus:border-fitbox-red"
                                    placeholder="Describe qué le pasa a la máquina..."
                                    value={nuevasObservaciones}
                                    onChange={(e) => setNuevasObservaciones(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            <Button variant="ghost" className="flex-1" onClick={() => setMaquinaSeleccionada(null)}>Cancelar</Button>
                            <Button className="flex-1 bg-fitbox-red hover:bg-red-700 font-bold shadow-lg" onClick={handleActualizarEstado}>Guardar Cambios</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* VENTANITA (MODAL): Para crear máquina nueva (Admin) */}
            {isCreando && isAdmin && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-fitbox-card border border-neutral-800 p-8 rounded-2xl w-full max-w-md space-y-6 shadow-2xl my-8">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight border-b border-neutral-800 pb-2">
                            Nueva Máquina
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nombre o modelo *</label>
                                <Input
                                    autoFocus
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none focus:border-fitbox-red transition-colors"
                                    placeholder="Ej: Cinta de correr 2"
                                    value={nombreNuevaMaquina}
                                    onChange={(e) => setNombreNuevaMaquina(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Enlace Video Tutorial (Opcional)</label>
                                <Input
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none focus:border-fitbox-red transition-colors"
                                    placeholder="https://youtube.com/..."
                                    value={tutorialNuevaMaquina}
                                    onChange={(e) => setTutorialNuevaMaquina(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Descripción y consejos (Opcional)</label>
                                <textarea
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none min-h-25 resize-none focus:border-fitbox-red"
                                    placeholder="Instrucciones sobre cómo sentarse, ajustar el peso..."
                                    value={descripcionNuevaMaquina}
                                    onChange={(e) => setDescripcionNuevaMaquina(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-2">
                            <Button variant="ghost" className="flex-1" onClick={() => setIsCreando(false)}>Cancelar</Button>
                            <Button className="flex-1 bg-fitbox-red hover:bg-red-700 font-bold shadow-lg" onClick={handleCrearMaquina}>Añadir al Gimnasio</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};