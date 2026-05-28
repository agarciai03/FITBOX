import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { MachineRepository, type EstadoMaquina, type Maquina } from '../database/repositories/MachineRepository';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Dumbbell, AlertTriangle, CheckCircle, Info, Trash2, BookOpen, Plus, X, Settings } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';

const getCategoria = (nombre: string): string => {
    const n = nombre.toLowerCase();
    if (['saco', 'aqua bag', 'pera', 'bob', 'ring', 'escudos', 'manoplas', 'combas', 'espejos', 'asaltos'].some(k => n.includes(k))) return 'Boxeo';
    if (['tatami', 'dummy grappling', 'wall pad', 'cuerda de trepar', 'crash mat', 'foam roller', 'bandas', 'fitball', 'fat grip', 'sparring'].some(k => n.includes(k))) return 'Jiu Jitsu BJJ';
    if (['rig', 'anillas', 'remo', 'skierg', 'assault', 'ghd', 'olímpic', 'bumpers', 'cajon', 'kettlebell', 'wall ball', 'pegboard', 'trineo', 'césped'].some(k => n.includes(k))) return 'CrossFit';
    return 'Sala de Máquinas';
};

const CATEGORIAS = ['Sala de Máquinas', 'Boxeo', 'Jiu Jitsu BJJ', 'CrossFit'];

export const MaquinasPage = () => {
    const profile = useAuthStore((state) => state.profile);
    const rol = profile?.roles?.nombre_rol || 'Socio';
    const idRol = profile?.id_rol;
    const isAdmin = rol === 'Administrador' || idRol === 1;
    const isMonitor = rol === 'Monitor' || idRol === 2;
    const isStaff = isAdmin || isMonitor;

    const [maquinas, setMaquinas] = useState<Maquina[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [categoriaActiva, setCategoriaActiva] = useState<string>('Sala de Máquinas');
    
    const [maquinaSeleccionada, setMaquinaSeleccionada] = useState<Maquina | null>(null);
    const [nuevoEstado, setNuevoEstado] = useState<EstadoMaquina>('Correcto');
    const [nuevasObservaciones, setNuevasObservaciones] = useState('');
    
    const [isCreando, setIsCreando] = useState(false);
    const [nombreNuevaMaquina, setNombreNuevaMaquina] = useState('');
    const [descripcionNuevaMaquina, setDescripcionNuevaMaquina] = useState('');

    const [maquinaParaLeer, setMaquinaParaLeer] = useState<Maquina | null>(null);

    const cargarMaquinas = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await MachineRepository.getAllMaquinas();
            setMaquinas(data);
        } catch (errorCatch) {
            console.error("Error al cargar máquinas:", errorCatch);
            setError('Fallo al cargar el inventario desde el servidor.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarMaquinas();
    }, [cargarMaquinas]);

    const handleActualizarEstado = async () => {
        if (!maquinaSeleccionada || !profile?.id_usuario) return;
        setError(null); setSuccessMessage(null);
        try {
            await MachineRepository.updateEstado(
                maquinaSeleccionada.id_maquina,
                nuevoEstado,
                nuevasObservaciones,
                profile.id_usuario
            );
            setMaquinaSeleccionada(null);
            setSuccessMessage("Estado de la máquina actualizado correctamente.");
            cargarMaquinas();
        } catch (errorCatch: any) {
            setError(errorCatch.message || 'No se pudo actualizar el estado.');
        }
    };

    const handleCrearMaquina = async () => {
        if (!nombreNuevaMaquina.trim()) return;
        setError(null); setSuccessMessage(null);
        try {
            // Se asume disciplina null por defecto al no existir selector de disciplina en el formulario
            await MachineRepository.createMaquina(nombreNuevaMaquina, null, descripcionNuevaMaquina);
            setIsCreando(false);
            setNombreNuevaMaquina(''); 
            setDescripcionNuevaMaquina('');
            setSuccessMessage("Máquina registrada con éxito en el sistema.");
            setCategoriaActiva(getCategoria(nombreNuevaMaquina));
            cargarMaquinas();
        } catch (errorCatch: any) {
            setError(errorCatch.message || 'Error al intentar crear la máquina.');
        }
    };

    const handleBorrarMaquina = async (id_maquina: string, nombre: string) => {
        if (!window.confirm(`¡ATENCIÓN! ¿Seguro que quieres borrar DEFINITIVAMENTE "${nombre}" del gimnasio?`)) return;
        setError(null); setSuccessMessage(null);
        try {
            await MachineRepository.deleteMaquina(id_maquina);
            setSuccessMessage("Máquina eliminada del inventario.");
            cargarMaquinas();
        } catch (errorCatch: any) {
            setError(errorCatch.message || 'Error al intentar borrar la máquina.');
        }
    };

    const maquinasCategoriaActual = maquinas.filter(m => getCategoria(m.nombre) === categoriaActiva);

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
            {/* CABECERA */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-800 pb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white flex items-center gap-3 uppercase tracking-tight">
                        <Settings className="size-8 md:size-10 text-fitbox-red" />
                        INVENTARIO <span className="text-fitbox-red">EQUIPAMIENTO</span>
                    </h1>
                    <p className="text-fitbox-text-muted mt-2 text-sm md:text-base">
                        {isStaff
                            ? 'Control de averías, alta de material y mantenimiento técnico del club.'
                            : 'Consulta los manuales de uso y el estado técnico del equipamiento.'
                        }
                    </p>
                </div>
                {isAdmin && (
                    <Button
                        onClick={() => setIsCreando(true)}
                        className="bg-fitbox-red hover:bg-red-700 text-white font-bold w-full md:w-auto shadow-lg shadow-fitbox-red/20 py-6"
                    >
                        <Plus className="size-5 mr-2" /> Registrar Equipamiento
                    </Button>
                )}
            </div>

            {/* ALERTAS */}
            {error && <Alert type="error" message={error} />}
            {successMessage && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg flex items-center gap-3 font-bold animate-in slide-in-from-top-2">
                    <CheckCircle className="size-5 shrink-0" /> <p>{successMessage}</p>
                </div>
            )}

            {/* SELECTOR DE CATEGORÍAS */}
            <div className="space-y-4">
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {CATEGORIAS.map(cat => {
                        const cantidad = maquinas.filter(m => getCategoria(m.nombre) === cat).length;
                        const activa = categoriaActiva === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => setCategoriaActiva(cat)}
                                className={`px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider whitespace-nowrap transition-all duration-300 border flex items-center gap-2 ${activa
                                    ? 'bg-fitbox-red border-fitbox-red text-white shadow-lg shadow-fitbox-red/20'
                                    : 'bg-neutral-900 border-neutral-800 text-gray-500 hover:bg-neutral-800 hover:text-white'
                                    }`}
                            >
                                {cat}
                                <span className={`px-2 py-0.5 rounded-full text-[10px] ${activa ? 'bg-white/20 text-white' : 'bg-neutral-800 text-gray-400'}`}>
                                    {cantidad}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* TABLA DE INVENTARIO */}
            {isLoading ? (
                <div className="py-20 text-center flex flex-col items-center">
                    <Dumbbell className="size-12 text-fitbox-red animate-spin mx-auto mb-4" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Cargando base de datos...</p>
                </div>
            ) : maquinasCategoriaActual.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/20 flex flex-col items-center">
                    <Settings className="size-16 text-neutral-800 mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Categoría Vacía</h3>
                    <p className="text-sm text-gray-500 max-w-md">
                        {isAdmin ? 'No hay máquinas registradas en esta sección. Añade la primera desde el botón superior.' : 'No hay equipamiento disponible aquí.'}
                    </p>
                </div>
            ) : (
                <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-900/80 text-gray-400 uppercase text-[10px] tracking-widest font-bold border-b border-neutral-800">
                                <tr>
                                    <th className="px-6 py-5 whitespace-nowrap">Equipo y Manuales</th>
                                    <th className="px-6 py-5 whitespace-nowrap">Estado Técnico</th>
                                    <th className="px-6 py-5 whitespace-nowrap">Registro Avería</th>
                                    <th className="px-6 py-5">Reporte / Observaciones</th>
                                    {isStaff && <th className="px-6 py-5 text-right whitespace-nowrap">Acciones</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800/50">
                                {maquinasCategoriaActual.map((maq) => {
                                    const esCorrecto = maq.estado === 'Correcto';
                                    const esDefectuoso = maq.estado === 'Defectuoso';
                                    const esObs = maq.estado === 'Correcto pero con observaciones';

                                    return (
                                        <tr key={maq.id_maquina} className={`hover:bg-neutral-900/50 transition-colors ${esDefectuoso ? 'bg-red-950/10' : ''}`}>
                                            {/* NOMBRE E INFO */}
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <span className={`font-black text-base uppercase tracking-tight ${esDefectuoso ? 'text-red-400' : 'text-white'}`}>
                                                        {maq.nombre}
                                                    </span>
                                                    {(maq.descripcion) && (
                                                        <button
                                                            onClick={() => setMaquinaParaLeer(maq)}
                                                            className="text-blue-400 hover:text-white p-1.5 bg-blue-500/10 rounded-md transition-colors border border-blue-500/20 hover:bg-blue-500/30 shrink-0"
                                                            title="Ver manual"
                                                        >
                                                            <BookOpen className="size-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>

                                            {/* ESTADO */}
                                            <td className="px-6 py-5">
                                                {esCorrecto && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-green-500/10 text-green-400 border border-green-500/20 uppercase tracking-wider">
                                                        <CheckCircle className="size-3.5" /> 100% Operativa
                                                    </span>
                                                )}
                                                {esDefectuoso && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-red-500/10 text-red-500 border border-red-500/20 uppercase tracking-wider">
                                                        <AlertTriangle className="size-3.5 animate-pulse" /> Fuera de Servicio
                                                    </span>
                                                )}
                                                {esObs && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 uppercase tracking-wider whitespace-nowrap">
                                                        <Info className="size-3.5" /> Revisión Pendiente
                                                    </span>
                                                )}
                                            </td>

                                            {/* FECHA AVERÍA */}
                                            <td className="px-6 py-5 text-gray-500 font-bold text-[11px] tracking-wider uppercase">
                                                {maq.fecha_averia ? new Date(maq.fecha_averia).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '-- / -- / ----'}
                                            </td>

                                            {/* OBSERVACIONES */}
                                            <td className="px-6 py-5 max-w-62.5 truncate">
                                                {(!esCorrecto && maq.observaciones) ? (
                                                    <span className={`text-sm italic font-medium ${esDefectuoso ? 'text-red-400' : 'text-yellow-400'}`} title={maq.observaciones}>
                                                        "{maq.observaciones}"
                                                    </span>
                                                ) : (
                                                    <span className="text-neutral-700">-</span>
                                                )}
                                            </td>

                                            {/* BOTONES DE ACCIÓN */}
                                            {isStaff && (
                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            className="h-9 px-4 font-black text-[10px] uppercase tracking-wider bg-neutral-800 text-gray-300 hover:bg-neutral-700 hover:text-white border-none shadow-md"
                                                            onClick={() => {
                                                                setMaquinaSeleccionada(maq);
                                                                setNuevoEstado(maq.estado);
                                                                setNuevasObservaciones(maq.observaciones || '');
                                                            }}
                                                        >
                                                            Gestionar Estado
                                                        </Button>
                                                        {isAdmin && (
                                                            <button
                                                                onClick={() => handleBorrarMaquina(maq.id_maquina, maq.nombre)}
                                                                className="text-gray-400 hover:text-white p-2.5 rounded-lg hover:bg-red-700 transition-colors shadow-md"
                                                                title="Eliminar DEFINITIVAMENTE del inventario"
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODAL: CREAR MÁQUINA NUEVA */}
            {isCreando && isAdmin && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <Card className="bg-neutral-950 border border-neutral-800 p-6 md:p-8 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-fitbox-red to-red-900"></div>
                        <button onClick={() => setIsCreando(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
                            <X className="size-6" />
                        </button>
                        
                        <div className="mb-6">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">
                                Registrar <span className="text-fitbox-red">Máquina</span>
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">Incorpora nuevo material a la base de datos.</p>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest" htmlFor="nombre_oficial">Nombre / Modelo Oficial *</label>
                                <Input
                                    id="nombre_oficial"
                                    className="w-full bg-neutral-900 border-neutral-800 text-white px-4 py-3 outline-none focus:border-fitbox-red font-bold transition-colors"
                                    placeholder="Ej: Press de Banca Olímpico"
                                    value={nombreNuevaMaquina}
                                    onChange={(e) => setNombreNuevaMaquina(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest" htmlFor="ficha_tecnica">Ficha Técnica / Instrucciones (Opcional)</label>
                                <textarea
                                    id="ficha_tecnica"
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none min-h-30 resize-y focus:border-fitbox-red placeholder:text-neutral-600 text-sm"
                                    placeholder="Pautas de uso, precauciones de seguridad, peso máximo..."
                                    value={descripcionNuevaMaquina}
                                    onChange={(e) => setDescripcionNuevaMaquina(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-6 mt-4">
                            <Button variant="ghost" className="flex-1 text-gray-400 hover:text-white hover:bg-neutral-900 font-bold" onClick={() => setIsCreando(false)}>Cancelar</Button>
                            <Button className="flex-1 bg-fitbox-red hover:bg-red-700 font-bold shadow-lg shadow-fitbox-red/20 text-white" onClick={handleCrearMaquina}>
                                Guardar Máquina
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* MODAL: CAMBIAR ESTADO */}
            {maquinaSeleccionada && isStaff && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <Card className="bg-neutral-950 border border-neutral-800 p-6 md:p-8 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-full h-1 transition-colors duration-500 ${nuevoEstado === 'Correcto' ? 'bg-green-500' :
                            nuevoEstado === 'Defectuoso' ? 'bg-red-500' : 'bg-yellow-500'
                            }`}></div>
                        
                        <h3 className="text-xl font-semibold text-white mb-6 pr-6 leading-tight">
                            Gestión: <span className="text-fitbox-red uppercase">{maquinaSeleccionada.nombre}</span>
                        </h3>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest" htmlFor="estado_tecnico">Cambiar Estado Técnico</label>
                                <select
                                    id="estado_tecnico"
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white font-bold rounded-lg px-4 py-4 outline-none focus:border-fitbox-red transition-all"
                                    value={nuevoEstado}
                                    onChange={(e) => setNuevoEstado(e.target.value as EstadoMaquina)}
                                >
                                    <option value="Correcto">✅ OPERATIVA (100% Funcional)</option>
                                    <option value="Correcto pero con observaciones">⚠️ REVISIÓN PENDIENTE (Posible falla)</option>
                                    <option value="Defectuoso">❌ AVERIADA (Fuera de servicio)</option>
                                </select>
                            </div>

                            {nuevoEstado !== 'Correcto' && (
                                <div className="space-y-2 animate-in slide-in-from-top-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest" htmlFor="reporte_problema">Reporte del problema</label>
                                    <textarea
                                        id="reporte_problema"
                                        className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none min-h-30 resize-y focus:border-fitbox-red placeholder:text-neutral-600 text-sm font-medium"
                                        placeholder="Detalla qué pieza falla, si hay ruido extraño, cable suelto..."
                                        value={nuevasObservaciones}
                                        onChange={(e) => setNuevasObservaciones(e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="flex gap-4 pt-4 mt-2">
                                <Button variant="ghost" className="flex-1 text-gray-400 hover:text-white hover:bg-neutral-900 font-bold" onClick={() => setMaquinaSeleccionada(null)}>Cancelar</Button>
                                <Button className="flex-1 bg-fitbox-red hover:bg-red-700 font-bold shadow-lg shadow-fitbox-red/20 text-white" onClick={handleActualizarEstado}>
                                    Confirmar Estado
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* MODAL: VER MANUAL */}
            {maquinaParaLeer && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <Card className="bg-neutral-950 border border-neutral-800 p-6 md:p-8 rounded-2xl w-full max-w-lg shadow-2xl relative">
                        <button onClick={() => setMaquinaParaLeer(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
                            <X className="size-6" />
                        </button>
                        
                        <div className="mb-6 pr-8 border-b border-neutral-800 pb-4">
                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                                <BookOpen className="text-blue-400 size-6" /> {maquinaParaLeer.nombre}
                            </h3>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">Ficha Técnica Oficial</p>
                        </div>

                        <div className="space-y-6">
                            {maquinaParaLeer.descripcion && (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Instrucciones de Uso</h4>
                                    <div className="text-gray-300 leading-relaxed text-sm bg-neutral-900/50 p-5 rounded-xl border border-neutral-800/50 whitespace-pre-wrap font-medium">
                                        {maquinaParaLeer.descripcion}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};