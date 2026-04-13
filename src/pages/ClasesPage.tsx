import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { ClassRepository, type Clase, type Disciplina, type Rutina } from '../database/repositories/ClassRepository';
import { supabase } from '../database/supabase/Client';
import { Button } from '../components/ui/Button';
import { Calendar, Dumbbell, Trash2, Clock, CheckCircle } from 'lucide-react';

interface MonitorBasico {
    id_usuario: string;
    nombre: string;
    apellidos: string;
}

export const ClasesPage = () => {
    // --- 1. ESTADO Y VARIABLES ---
    const profile = useAuthStore((state) => state.profile);
    const rol = profile?.roles?.nombre_rol || 'Socio';
    const isAdmin = rol === 'Administrador';
    const isSocio = rol === 'Socio';

    const [clases, setClases] = useState<Clase[]>([]);
    const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
    const [rutinas, setRutinas] = useState<Rutina[]>([]);

    const [monitores, setMonitores] = useState<MonitorBasico[]>([]);
    const [misReservasActivas, setMisReservasActivas] = useState<string[]>([]);

    const [vistaActiva, setVistaActiva] = useState<'horarios' | 'rutinas'>('horarios');
    const [disciplinaSeleccionada, setDisciplinaSeleccionada] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [isCreando, setIsCreando] = useState(false);
    const [nuevaClase, setNuevaClase] = useState({
        id_disciplina: '',
        id_monitor: '',
        fecha: '',
        hora_inicio: '',
        hora_fin: '',
        aforo_maximo: 20
    });

    // --- 2. FUNCIONES DE CARGA ---
    const cargarDatos = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const dataClases = await ClassRepository.getAllClases();
            const dataDisciplinas = await ClassRepository.getAllDisciplinas();

            setClases(dataClases);
            setDisciplinas(dataDisciplinas);

            if (dataDisciplinas.length > 0 && !disciplinaSeleccionada) {
                setDisciplinaSeleccionada(dataDisciplinas[0].id_disciplina);
            }

            const { data: dataMonitores, error: errorSupabase } = await supabase
                .from('usuarios')
                .select('id_usuario, nombre, apellidos')
                .eq('id_rol', 2);

            if (errorSupabase) throw errorSupabase;
            if (dataMonitores) setMonitores(dataMonitores);

            if (isSocio && profile?.id_usuario) {
                const misReservas = await ClassRepository.getReservasBySocio(profile.id_usuario);
                const idsClasesReservadas = misReservas.map(reserva => reserva.id_clase);
                setMisReservasActivas(idsClasesReservadas);
            }

        } catch (errorCatch) {
            console.error("Fallo al cargar datos:", errorCatch);
            setError('Error de conexión. No se han podido cargar las clases.');
        } finally {
            setIsLoading(false);
        }
    }, [isSocio, profile?.id_usuario, disciplinaSeleccionada]);

    useEffect(() => {
        if (disciplinaSeleccionada) {
            ClassRepository.getRutinasByDisciplina(disciplinaSeleccionada)
                .then(data => setRutinas(data))
                .catch(errorCatch => {
                    console.error("Fallo en rutinas:", errorCatch);
                    setError("No se pudieron cargar las rutinas de esta disciplina.");
                });
        }
    }, [disciplinaSeleccionada]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    // --- 3. ACCIONES (RESERVAR, CREAR, BORRAR) ---

    const handleCrearClase = async () => {
        if (!nuevaClase.id_disciplina || !nuevaClase.fecha || !nuevaClase.hora_inicio || !nuevaClase.hora_fin) {
            setError("Por favor, rellena todos los campos obligatorios.");
            return;
        }
        try {
            await ClassRepository.createClase({
                id_disciplina: nuevaClase.id_disciplina,
                id_monitor: nuevaClase.id_monitor || null,
                fecha: nuevaClase.fecha,
                hora_inicio: nuevaClase.hora_inicio,
                hora_fin: nuevaClase.hora_fin,
                aforo_maximo: nuevaClase.aforo_maximo
            });
            setIsCreando(false);
            cargarDatos();
        } catch (errorCatch) {
            console.error("Error al crear:", errorCatch);
            if (errorCatch instanceof Error) {
                setError(errorCatch.message);
            } else {
                setError('Error desconocido al crear la clase.');
            }
        }
    }; 

    const handleBorrarClase = async (id_clase: string) => {
        if (!window.confirm("¿Seguro que quieres borrar esta clase?")) return;
        try {
            await ClassRepository.deleteClase(id_clase);
            cargarDatos();
        } catch (errorCatch) {
            console.error("Error al borrar:", errorCatch);
            if (errorCatch instanceof Error) {
                setError(errorCatch.message);
            } else {
                setError("No se ha podido eliminar la clase.");
            }
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
            if (errorCatch instanceof Error) {
                setError(errorCatch.message);
            } else {
                setError("Error al intentar reservar.");
            }
        }
    };

    // --- 4. RENDERIZADO (DISEÑO) ---
    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            {/* Cabecera */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-fitbox-red" />
                        HORARIOS Y <span className="text-fitbox-red">RESERVAS</span>
                    </h1>
                    <p className="text-fitbox-text-muted mt-1">Gestiona tus entrenamientos y consulta plazas libres.</p>
                </div>

                <div className="flex gap-2">
                    <Button variant={vistaActiva === 'horarios' ? 'default' : 'secondary'} onClick={() => setVistaActiva('horarios')}>
                        Calendario
                    </Button>
                    <Button variant={vistaActiva === 'rutinas' ? 'default' : 'secondary'} onClick={() => setVistaActiva('rutinas')}>
                        Rutinas
                    </Button>
                </div>
            </div>

            {/* Mensajes de Alerta */}
            {error && <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg font-medium">{error}</div>}
            {successMessage && (
                <div className="p-4 bg-green-500/10 border border-green-500/50 text-green-500 rounded-lg flex items-center gap-2 font-medium">
                    <CheckCircle className="w-5 h-5" /> {successMessage}
                </div>
            )}

            {/* TABLA DE HORARIOS */}
            {vistaActiva === 'horarios' && (
                <div className="space-y-4">
                    {isAdmin && <div className="flex justify-end"><Button onClick={() => setIsCreando(true)}>+ Nueva Clase</Button></div>}

                    <div className="bg-fitbox-card border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-800/50 text-fitbox-text-muted uppercase text-[10px] tracking-widest font-bold">
                                <tr>
                                    <th className="px-6 py-4">Día / Fecha</th>
                                    <th className="px-6 py-4">Horario</th>
                                    <th className="px-6 py-4">Disciplina</th>
                                    <th className="px-6 py-4 text-center">Aforo / Plazas</th>
                                    <th className="px-6 py-4 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800">
                                {isLoading ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Actualizando calendario...</td></tr>
                                ) : (
                                    clases.map((clase) => {
                                        // LOGICA DE AFORO (RF-07)
                                        const ocupadas = clase.total_reservas || 0;
                                        const total = clase.aforo_maximo;
                                        const estaLlena = ocupadas >= total;
                                        const yaReservada = misReservasActivas.includes(clase.id_clase);
                                        const porcentajeOcupado = (ocupadas / total) * 100;

                                        return (
                                            <tr key={clase.id_clase} className="hover:bg-neutral-800/20 transition-colors">
                                                <td className="px-6 py-4 font-bold text-white">
                                                    {new Date(clase.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-gray-300">
                                                        <Clock className="w-4 h-4 text-fitbox-red" />
                                                        {clase.hora_inicio.slice(0, 5)} - {clase.hora_fin.slice(0, 5)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-neutral-800 text-fitbox-red px-3 py-1 rounded-full text-[11px] font-black uppercase border border-fitbox-red/20">
                                                        {clase.disciplinas?.nombre}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {/* BARRA DE AFORO VISUAL */}
                                                    <div className="flex flex-col gap-1 items-center">
                                                        <span className={`text-[11px] font-bold ${estaLlena ? 'text-red-500' : 'text-gray-400'}`}>
                                                            {ocupadas} / {total} {estaLlena ? '(LLENO)' : 'Plazas'}
                                                        </span>
                                                        <div className="w-24 h-1.5 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700">
                                                            <div
                                                                className={`h-full transition-all duration-500 ${estaLlena ? 'bg-red-600' : 'bg-fitbox-red'}`}
                                                                style={{ width: `${porcentajeOcupado}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {isAdmin && (
                                                        <button onClick={() => handleBorrarClase(clase.id_clase)} className="text-red-500 hover:text-red-400 mr-4">
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    )}

                                                    {isSocio && (
                                                        yaReservada ? (
                                                            <span className="text-green-500 font-bold text-xs flex items-center justify-end gap-1">
                                                                <CheckCircle className="w-4 h-4" /> RECUERDA ASISTIR
                                                            </span>
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
                </div>
            )}

            {/* PESTAÑA RUTINAS */}
            {vistaActiva === 'rutinas' && (
                <div className="space-y-6">
                    <div className="flex items-center gap-4 bg-fitbox-card p-4 rounded-xl border border-neutral-800">
                        <Dumbbell className="w-6 h-6 text-fitbox-red" />
                        <label className="font-bold text-white uppercase text-sm">Disciplina:</label>
                        <select
                            className="bg-neutral-900 border border-neutral-700 text-white rounded-md px-3 py-2 text-sm focus:border-fitbox-red outline-none"
                            value={disciplinaSeleccionada}
                            onChange={(e) => setDisciplinaSeleccionada(e.target.value)}
                        >
                            {disciplinas.map(d => <option key={d.id_disciplina} value={d.id_disciplina}>{d.nombre}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rutinas.map(rutina => (
                            <div key={rutina.id_rutina} className="bg-fitbox-card p-6 rounded-xl border border-neutral-800 hover:border-fitbox-red/30 transition-all">
                                <h3 className="font-black text-fitbox-red uppercase tracking-tighter mb-1">{rutina.dia_semana}</h3>
                                <p className="font-bold text-white mb-2">{rutina.titulo}</p>
                                <p className="text-sm text-fitbox-text-muted leading-relaxed">{rutina.descripcion}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MODAL CREAR (Solo Admin) */}
            {isCreando && isAdmin && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-fitbox-card border border-neutral-800 p-8 rounded-2xl w-full max-w-md space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <h3 className="text-2xl font-black text-white uppercase italic">Nueva Sesión</h3>
                        <div className="space-y-4">

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Disciplina</label>
                                <select className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none focus:border-fitbox-red transition-all" onChange={(e) => setNuevaClase({ ...nuevaClase, id_disciplina: e.target.value })}>
                                    <option value="">Selecciona...</option>
                                    {disciplinas.map(d => <option key={d.id_disciplina} value={d.id_disciplina}>{d.nombre}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Monitor Asignado (Opcional)</label>
                                <select className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none focus:border-fitbox-red transition-all" onChange={(e) => setNuevaClase({ ...nuevaClase, id_monitor: e.target.value })}>
                                    <option value="">Sin Monitor</option>
                                    {monitores.map(m => <option key={m.id_usuario} value={m.id_usuario}>{m.nombre} {m.apellidos}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Fecha</label>
                                    <input type="date" className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none" onChange={(e) => setNuevaClase({ ...nuevaClase, fecha: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Aforo</label>
                                    <input type="number" defaultValue={20} className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none" onChange={(e) => setNuevaClase({ ...nuevaClase, aforo_maximo: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Inicio</label>
                                    <input type="time" className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none" onChange={(e) => setNuevaClase({ ...nuevaClase, hora_inicio: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Fin</label>
                                    <input type="time" className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-3 outline-none" onChange={(e) => setNuevaClase({ ...nuevaClase, hora_fin: e.target.value })} />
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