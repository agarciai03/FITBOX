import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { ClassRepository, type Clase, type Disciplina } from '../database/repositories/ClassRepository';
import { MachineRepository, type Maquina } from '../database/repositories/MachineRepository';
import { supabase } from '../database/supabase/Client';
import { Button } from '../components/ui/Button';
import { Calendar, Trash2, Clock, CheckCircle, CalendarX2, Plus, X, AlertTriangle, Info, Dumbbell } from 'lucide-react';

interface MonitorBasico {
    id_usuario: string;
    nombre: string;
    apellidos: string;
}

export const ClasesPage = () => {
    const profile = useAuthStore((state) => state.profile);
    const rol = profile?.roles?.nombre_rol || 'Socio';

    const isAdmin = rol === 'Administrador';
    const isMonitor = rol === 'Monitor';
    const isSocio = rol === 'Socio';
    const canManage = isAdmin || isMonitor;

    const [clases, setClases] = useState<Clase[]>([]);
    const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
    const [monitores, setMonitores] = useState<MonitorBasico[]>([]);
    const [maquinasGlobales, setMaquinasGlobales] = useState<Maquina[]>([]);
    const [misReservasActivas, setMisReservasActivas] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [isCreando, setIsCreando] = useState(false);

    const [nuevaClase, setNuevaClase] = useState({
        id_disciplina: isMonitor && (profile as any)?.id_disciplina ? (profile as any).id_disciplina : '',
        id_monitor: isMonitor && profile?.id_usuario ? profile.id_usuario : '',
        fecha: '',
        hora_inicio: '',
        hora_fin: '',
        aforo_maximo: 20
    });

    const [modalMaterial, setModalMaterial] = useState({
        isOpen: false,
        id_disciplina: '',
        nombre_disciplina: ''
    });

    const [ahora, setAhora] = useState(new Date());

    const cargarDatos = useCallback(async () => {
        try {
            if (clases.length === 0) setIsLoading(true);
            setError(null);

            const [dataClases, dataDisciplinas, dataMaquinas] = await Promise.all([
                ClassRepository.getAllClases(),
                ClassRepository.getAllDisciplinas(),
                MachineRepository.getAllMaquinas()
            ]);

            setClases(dataClases);
            setDisciplinas(dataDisciplinas);
            setMaquinasGlobales(dataMaquinas);

            const { data: dataMonitores, error: errorSupabase } = await supabase
                .from('usuarios')
                .select('id_usuario, nombre, apellidos')
                .eq('id_rol', 2);

            if (errorSupabase) throw errorSupabase;
            if (dataMonitores) setMonitores(dataMonitores);

            if (isSocio && profile?.id_usuario) {
                const misReservas = await ClassRepository.getReservasBySocio(profile.id_usuario);
                setMisReservasActivas(misReservas);
            }

        } catch (errorCatch) {
            console.error("Fallo al cargar datos:", errorCatch);
            setError('Error de conexión. No se han podido cargar las clases.');
        } finally {
            setIsLoading(false);
        }
    }, [isSocio, profile?.id_usuario, clases.length]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    useEffect(() => {
        const interval = setInterval(() => setAhora(new Date()), 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const channel = supabase.channel('realtime-clases-maquinas')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'reservas' }, cargarDatos)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'clases' }, cargarDatos)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'maquinas' }, cargarDatos);

        channel.subscribe();

        return () => {
            channel.unsubscribe();
            supabase.removeChannel(channel);
        };
    }, [cargarDatos]);

    useEffect(() => {
        if (canManage && clases.length > 0) {
            const cleanup = async () => {
                const limiteBorrado = new Date(ahora.getTime() - 2 * 60 * 60 * 1000);
                const clasesViejas = clases.filter(clase => new Date(`${clase.fecha}T${clase.hora_fin}`) < limiteBorrado);
                
                if (clasesViejas.length > 0) {
                    await Promise.all(
                        clasesViejas.map(clase => 
                            ClassRepository.deleteClase(clase.id_clase).catch(e => console.error("Fallo borrado:", e))
                        )
                    );
                }
            };
            cleanup();
        }
    }, [canManage, clases, ahora]);

    const handleCrearClase = async () => {
        if (!nuevaClase.id_disciplina || !nuevaClase.fecha || !nuevaClase.hora_inicio || !nuevaClase.hora_fin) {
            setError("Por favor, rellena todos los campos obligatorios.");
            return;
        }

        // Validar que la fecha y hora no estén en el pasado
        const fechaHoraInicio = new Date(`${nuevaClase.fecha}T${nuevaClase.hora_inicio}`);
        if (fechaHoraInicio < ahora) {
            setError("No puedes crear una clase en una fecha u hora que ya ha pasado. Por favor, selecciona una fecha y hora futuras.");
            return;
        }

        const disciplinaElegida = disciplinas.find(d => d.id_disciplina === nuevaClase.id_disciplina);

        if (disciplinaElegida && disciplinaElegida.nombre !== 'Sala de Máquinas') {
            const fechaSeleccionada = new Date(nuevaClase.fecha);
            const diaSemana = fechaSeleccionada.getDay();
            if (diaSemana === 0 || diaSemana === 6) {
                setError(`La disciplina "${disciplinaElegida.nombre}" solo puede programarse de Lunes a Viernes.`);
                return;
            }
        }

        try {
            const aforoBD = disciplinaElegida?.aforo_maximo || 20;

            await ClassRepository.createClase({
                id_disciplina: nuevaClase.id_disciplina,
                id_monitor: nuevaClase.id_monitor || null,
                fecha: nuevaClase.fecha,
                hora_inicio: nuevaClase.hora_inicio,
                hora_fin: nuevaClase.hora_fin,
                aforo_maximo: aforoBD
            });

            setIsCreando(false);
            setNuevaClase({
                id_disciplina: isMonitor && (profile as any)?.id_disciplina ? (profile as any).id_disciplina : '',
                id_monitor: isMonitor && profile?.id_usuario ? profile.id_usuario : '',
                fecha: '',
                hora_inicio: '',
                hora_fin: '',
                aforo_maximo: 20
            });
            cargarDatos();
        } catch (errorCatch) {
            console.error("Error al crear:", errorCatch);
            if (errorCatch instanceof Error) setError(errorCatch.message);
            else setError('Error desconocido al crear la clase.');
        }
    };

    const handleBorrarClase = async (id_clase: string) => {
        if (!window.confirm("¿Seguro que quieres borrar esta clase?")) return;
        try {
            await ClassRepository.deleteClase(id_clase);
            cargarDatos();
        } catch (errorCatch) {
            console.error("Error al borrar:", errorCatch);
            if (errorCatch instanceof Error) setError(errorCatch.message);
            else setError("No se ha podido eliminar la clase.");
        }
    };

    const handleReservar = async (id_clase: string) => {
        setError(null);
        setSuccessMessage(null);
        if (!profile?.id_usuario) return;

        try {
            await ClassRepository.reservarClase(id_clase, profile.id_usuario);
            setSuccessMessage("¡Plaza reservada con éxito!");
            cargarDatos();
        } catch (errorCatch) {
            console.error("Error reserva:", errorCatch);
            if (errorCatch instanceof Error) setError(errorCatch.message);
            else setError("Error al intentar reservar.");
        }
    };

    const handleCancelarReserva = async (id_reserva: string) => {
        if (!window.confirm("¿Seguro que quieres anular tu asistencia a esta clase?")) return;
        setError(null);
        setSuccessMessage(null);
        try {
            await ClassRepository.cancelarReserva(id_reserva);
            setSuccessMessage("Reserva cancelada correctamente.");
            cargarDatos();
        } catch (errorCatch) {
            console.error("Error al cancelar:", errorCatch);
            setError("No se ha podido cancelar la reserva.");
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-300 mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                        <Calendar className="size-8 text-fitbox-red" />
                        HORARIOS Y <span className="text-fitbox-red">RESERVAS</span>
                    </h1>
                    <p className="text-fitbox-text-muted mt-1">Gestiona tus entrenamientos y consulta plazas libres.</p>
                </div>
            </div>

            {error && <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg font-medium">{error}</div>}
            {successMessage && (
                <div className="p-4 bg-green-500/10 border border-green-500/50 text-green-500 rounded-lg flex items-center gap-2 font-medium">
                    <CheckCircle className="size-5" /> {successMessage}
                </div>
            )}

            <div className="space-y-4">
                {canManage && (
                    <div className="flex justify-end">
                        <Button
                            onClick={() => {
                                setIsCreando(true);
                                setError(null);
                                setNuevaClase({
                                    id_disciplina: isMonitor && (profile as any)?.id_disciplina ? (profile as any).id_disciplina : '',
                                    id_monitor: isMonitor && profile?.id_usuario ? profile.id_usuario : '',
                                    fecha: '',
                                    hora_inicio: '',
                                    hora_fin: '',
                                    aforo_maximo: 20
                                });
                            }}
                            className="bg-white text-black hover:bg-fitbox-red hover:text-white font-black transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/20 px-6 py-5 rounded-xl flex items-center gap-2 uppercase italic tracking-tighter"
                        >
                            <Plus className="size-5 stroke-[3px]" />
                            Programar Sesión
                        </Button>
                    </div>
                )}

                {!isLoading && clases.length === 0 ? (
                    <div className="bg-fitbox-card border border-neutral-800 rounded-xl p-12 flex flex-col items-center justify-center text-center shadow-2xl animate-in fade-in duration-500">
                        <div className="size-20 bg-neutral-900 rounded-full flex items-center justify-center mb-6 border border-neutral-800">
                            <CalendarX2 className="size-10 text-gray-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">No hay <span className="text-fitbox-red">clases programadas</span></h2>
                        <p className="text-gray-400 max-w-md mb-8">
                            {canManage
                                ? "Actualmente el calendario está vacío. Como parte del equipo, puedes crear la primera sesión ahora mismo."
                                : "El gimnasio no tiene ninguna sesión programada en este momento. Vuelve a consultar más tarde."}
                        </p>
                        {canManage && (
                            <Button onClick={() => setIsCreando(true)} className="bg-fitbox-red hover:bg-red-700 shadow-lg shadow-fitbox-red/20 font-bold px-8">
                                CREAR CLASE
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="bg-fitbox-card border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-800/50 text-fitbox-text-muted uppercase text-[10px] tracking-widest font-bold">
                                <tr>
                                    <th className="px-6 py-4">Día / Fecha</th>
                                    <th className="px-6 py-4">Horario</th>
                                    <th className="px-6 py-4">Disciplina</th>
                                    <th className="px-6 py-4 text-center">Equipamiento</th>
                                    <th className="px-6 py-4 text-center">Aforo / Plazas</th>
                                    <th className="px-6 py-4 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800">
                                {isLoading ? (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Actualizando calendario…</td></tr>
                                ) : (
                                    clases.map((clase) => {
                                        const reservasActivas = clase.reservas?.filter(r => r.estado === 'activa') || [];
                                        const ocupadas = reservasActivas.length;
                                        const total = clase.aforo_maximo;
                                        const estaLlena = ocupadas >= total;

                                        const miReserva = misReservasActivas.find(r => r.id_clase === clase.id_clase);

                                        const porcentajeOcupado = (ocupadas / total) * 100;
                                        const fechaFinClase = new Date(`${clase.fecha}T${clase.hora_fin}`);
                                        const estaFinalizada = ahora > fechaFinClase;

                                        return (
                                            <tr key={clase.id_clase} className={`transition-colors ${estaFinalizada ? 'bg-black/40 opacity-75' : 'hover:bg-neutral-800/20'}`}>
                                                <td suppressHydrationWarning className="px-6 py-4 font-bold text-white whitespace-nowrap">
                                                    {new Date(clase.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className={`flex items-center gap-2 ${estaFinalizada ? 'text-gray-500' : 'text-gray-300'}`}>
                                                        <Clock className={`size-4 ${estaFinalizada ? 'text-gray-600' : 'text-fitbox-red'}`} />
                                                        {clase.hora_inicio.slice(0, 5)} - {clase.hora_fin.slice(0, 5)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`${estaFinalizada ? 'bg-neutral-900 text-gray-500 border-gray-700' : 'bg-neutral-800 text-fitbox-red border-fitbox-red/20'} px-3 py-1 rounded-full text-[11px] font-black uppercase border whitespace-nowrap`}>
                                                        {clase.disciplinas?.nombre}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-center">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-[10px] uppercase font-bold border-neutral-700 hover:border-fitbox-red text-gray-300"
                                                        onClick={() => setModalMaterial({
                                                            isOpen: true,
                                                            id_disciplina: clase.id_disciplina,
                                                            nombre_disciplina: clase.disciplinas?.nombre || 'General'
                                                        })}
                                                    >
                                                        <Dumbbell className="size-3.5 mr-1" />
                                                        Ver Material
                                                    </Button>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1 items-center">
                                                        <span className={`text-[11px] font-bold ${estaFinalizada ? 'text-gray-500' : estaLlena ? 'text-red-500' : 'text-gray-400'}`}>
                                                            {estaFinalizada ? 'CLASE FINALIZADA' : `${ocupadas} / ${total} ${estaLlena ? '(LLENO)' : 'Plazas'}`}
                                                        </span>
                                                        <div className={`w-24 h-1.5 rounded-full overflow-hidden border ${estaFinalizada ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-800 border-neutral-700'}`}>
                                                            <div
                                                                className={`h-full transition-all duration-500 ${estaFinalizada ? 'bg-gray-600' : estaLlena ? 'bg-red-600' : 'bg-fitbox-red'}`}
                                                                style={{ width: `${estaFinalizada ? 100 : porcentajeOcupado}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 flex flex-wrap gap-1 justify-center max-w-62.5 mx-auto">
                                                        {reservasActivas.length > 0 ? (
                                                            reservasActivas.map(r => (
                                                                <span key={r.id} className="bg-neutral-900 border border-neutral-700 text-[10px] text-gray-300 px-2 py-0.5 rounded-md flex items-center gap-1.5 whitespace-nowrap">
                                                                    <div className={`size-1.5 rounded-full ${estaFinalizada ? 'bg-gray-600' : 'bg-green-500 animate-pulse'}`}></div>
                                                                    {r.usuarios?.nombre} {r.usuarios?.apellidos?.charAt(0)}.
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-[10px] text-gray-500 italic">Sin asistentes</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {canManage && (
                                                        <button onClick={() => handleBorrarClase(clase.id_clase)} className="text-red-500 hover:text-red-400 mr-4">
                                                            <Trash2 className="size-5" />
                                                        </button>
                                                    )}

                                                    {estaFinalizada ? (
                                                        <span className="text-gray-500 font-bold text-[10px] px-3 py-1.5 border border-gray-700 rounded-md bg-gray-900/50 uppercase tracking-widest inline-block">
                                                            Completada
                                                        </span>
                                                    ) : isSocio && (
                                                        miReserva ? (
                                                            <div className="flex items-center justify-end gap-3">
                                                                <span className="text-green-500 font-bold text-xs flex items-center gap-1">
                                                                    <CheckCircle className="size-4" /> APUNTADO
                                                                </span>
                                                                <button
                                                                    onClick={() => handleCancelarReserva(miReserva.id)}
                                                                    className="text-red-500 hover:text-white hover:bg-red-500 p-1.5 rounded-md transition-colors"
                                                                    title="Cancelar Reserva"
                                                                >
                                                                    <X className="size-4" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                disabled={estaLlena}
                                                                size="sm"
                                                                className={`text-[11px] font-black uppercase tracking-tighter ${estaLlena ? 'bg-neutral-800 text-gray-600' : 'bg-fitbox-red hover:bg-red-700'}`}
                                                                onClick={() => handleReservar(clase.id_clase)}
                                                            >
                                                                {estaLlena ? 'Sin hueco' : 'Reservar'}
                                                            </Button>
                                                        )
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODAL PARA VER EL MATERIAL EN TIEMPO REAL */}
            {modalMaterial.isOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-fitbox-card border border-neutral-800 p-6 md:p-8 rounded-2xl w-full max-w-lg space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="flex justify-between items-start border-b border-neutral-800 pb-4">
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">
                                    INVENTARIO <span className="text-fitbox-red">{modalMaterial.nombre_disciplina}</span>
                                </h3>
                                <p className="text-gray-400 mt-1 text-sm font-medium">Estado del equipamiento en tiempo real.</p>
                            </div>
                            <button onClick={() => setModalMaterial({ isOpen: false, id_disciplina: '', nombre_disciplina: '' })} className="text-gray-500 hover:text-white transition-colors">
                                <X className="size-6" />
                            </button>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin">
                            {(() => {
                                const maquinasSala = maquinasGlobales.filter(m => m.id_disciplina === modalMaterial.id_disciplina);

                                if (maquinasSala.length === 0) {
                                    return (
                                        <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6 text-center">
                                            <Dumbbell className="size-10 text-neutral-700 mx-auto mb-3" />
                                            <p className="text-sm text-gray-400 italic">No hay equipamiento técnico asignado a esta disciplina. ¡Todo es peso libre o cardio!</p>
                                        </div>
                                    );
                                }

                                return maquinasSala.map(m => {
                                    const esCorrecto = m.estado === 'Correcto';
                                    const esDefectuoso = m.estado === 'Defectuoso';
                                    const esObs = m.estado === 'Correcto pero con observaciones';

                                    return (
                                        <div key={m.id_maquina} className={`flex flex-col p-3 rounded-lg border ${esDefectuoso ? 'bg-red-950/20 border-red-900/30' : esObs ? 'bg-yellow-950/10 border-yellow-900/30' : 'bg-neutral-900/50 border-neutral-800/50'}`}>
                                            <div className="flex justify-between items-center">
                                                <span className={`font-bold text-sm ${esDefectuoso ? 'text-red-400 line-through opacity-70' : 'text-white'}`}>{m.nombre}</span>

                                                {esCorrecto && <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-1 rounded-full font-black uppercase tracking-wider flex items-center gap-1.5 border border-green-500/20"><CheckCircle className="size-3" /> Operativa</span>}
                                                {esDefectuoso && <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-1 rounded-full font-black uppercase tracking-wider flex items-center gap-1.5 border border-red-500/20"><AlertTriangle className="size-3" /> Averiada</span>}
                                                {esObs && <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded-full font-black uppercase tracking-wider flex items-center gap-1.5 border border-yellow-500/20"><Info className="size-3" /> En revisión</span>}
                                            </div>
                                            {!esCorrecto && m.observaciones && (
                                                <div className="mt-2 pt-2 border-t border-black/20">
                                                    <p className={`text-xs italic font-medium ${esDefectuoso ? 'text-red-400' : 'text-yellow-500'}`}>"{m.observaciones}"</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {isCreando && canManage && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-fitbox-card border border-neutral-800 p-8 rounded-2xl w-full max-w-md space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <h3 className="text-2xl font-black text-white uppercase italic">Nueva Sesión</h3>
                        <div className="space-y-4">

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Disciplina</label>
                                <select
                                    className={`w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none transition-all ${isMonitor ? 'opacity-60 cursor-not-allowed' : 'focus:border-fitbox-red'}`}
                                    value={nuevaClase.id_disciplina}
                                    onChange={(e) => setNuevaClase(prev => ({ ...prev, id_disciplina: e.target.value }))}
                                    disabled={isMonitor}
                                >
                                    <option value="">Selecciona…</option>
                                    {disciplinas.map(d => <option key={d.id_disciplina} value={d.id_disciplina}>{d.nombre} (Aforo: {d.aforo_maximo || 20})</option>)}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Monitor Asignado</label>
                                <select
                                    className={`w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none transition-all ${isMonitor ? 'opacity-60 cursor-not-allowed' : 'focus:border-fitbox-red'}`}
                                    value={nuevaClase.id_monitor}
                                    onChange={(e) => setNuevaClase(prev => ({ ...prev, id_monitor: e.target.value }))}
                                    disabled={isMonitor}
                                >
                                    <option value="">Sin Monitor</option>
                                    {monitores.map(m => <option key={m.id_usuario} value={m.id_usuario}>{m.nombre} {m.apellidos}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Fecha</label>
                                    <input
                                        type="date"
                                        className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none focus:border-fitbox-red transition-all"
                                        value={nuevaClase.fecha}
                                        onChange={(e) => setNuevaClase(prev => ({ ...prev, fecha: e.target.value }))}
                                    />
                                    {nuevaClase.id_disciplina && disciplinas.find(d => d.id_disciplina === nuevaClase.id_disciplina)?.nombre !== 'Sala de Máquinas' && (
                                        <p className="text-[10px] text-fitbox-red italic mt-1 font-bold">Solo de Lunes a Viernes</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Inicio</label>
                                    <input type="time" className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none" onChange={(e) => setNuevaClase(prev => ({ ...prev, hora_inicio: e.target.value }))} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Fin</label>
                                    <input type="time" className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none" onChange={(e) => setNuevaClase(prev => ({ ...prev, hora_fin: e.target.value }))} />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <Button variant="ghost" className="flex-1" onClick={() => setIsCreando(false)}>Cerrar</Button>
                            <Button className="flex-1 bg-fitbox-red" onClick={handleCrearClase}>Guardar</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};