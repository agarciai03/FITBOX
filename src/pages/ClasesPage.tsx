import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { ClassRepository, type Clase, type Disciplina, type Rutina } from '../database/repositories/ClassRepository';
import { supabase } from '../database/supabase/Client';
import { Button } from '../components/ui/Button';
// NUEVO: Añadimos CheckCircle para el mensaje de éxito
import { Calendar, Dumbbell, Trash2, Clock, Users, CheckCircle } from 'lucide-react';

// Pon esto debajo de los imports
interface MonitorBasico {
    id_usuario: string;
    nombre: string;
    apellidos: string;
}

export const ClasesPage = () => {
    // 1. Quién está mirando la pantalla
    const profile = useAuthStore((state) => state.profile);
    const rol = profile?.roles?.nombre_rol || 'Socio';
    const isAdmin = rol === 'Administrador';
    const isSocio = rol === 'Socio'; // NUEVO: Para saber si es el cliente

    // 2. Variables para guardar los datos de la base de datos
    const [clases, setClases] = useState<Clase[]>([]);
    const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
    const [rutinas, setRutinas] = useState<Rutina[]>([]);
    const [monitores, setMonitores] = useState<MonitorBasico[]>([]);
    
    // NUEVO: Guardamos los IDs de las clases a las que el socio YA está apuntado
    const [misReservasActivas, setMisReservasActivas] = useState<string[]>([]);

    // 3. Control de la vista (Pestañas) y cargas
    const [vistaActiva, setVistaActiva] = useState<'horarios' | 'rutinas'>('horarios');
    const [disciplinaSeleccionada, setDisciplinaSeleccionada] = useState<string>(''); // Para filtrar rutinas
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null); // NUEVO: Para el mensaje de reserva correcta

    // 4. Variables para la ventanita de "Crear Clase" (Solo Admin)
    const [isCreando, setIsCreando] = useState(false);
    const [nuevaClase, setNuevaClase] = useState({
        id_disciplina: '',
        id_monitor: '',
        fecha: '',
        hora_inicio: '',
        hora_fin: '',
        aforo_maximo: 20
    });

    // Función para cargar todo al entrar a la página
    const cargarDatos = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const dataClases = await ClassRepository.getAllClases();
            const dataDisciplinas = await ClassRepository.getAllDisciplinas();

            setClases(dataClases);
            setDisciplinas(dataDisciplinas);

            if (dataDisciplinas.length > 0) {
                setDisciplinaSeleccionada(dataDisciplinas[0].id_disciplina);
            }

            const { data: dataMonitores } = await supabase
                .from('usuarios')
                .select('id_usuario, nombre, apellidos')
                .eq('id_rol', 2);

            if (dataMonitores) setMonitores(dataMonitores);

            // Si es un socio, buscamos a qué clases está apuntado ya
            if (isSocio && profile?.id_usuario) {
                const misReservas = await ClassRepository.getReservasBySocio(profile.id_usuario);
                const idsClasesReservadas = misReservas.map(reserva => reserva.id_clase);
                setMisReservasActivas(idsClasesReservadas);
            }

        } catch (err) {
            console.error(err);
            setError('Error al cargar los datos del calendario.');
        } finally {
            setIsLoading(false);
        }
    }, [isSocio, profile?.id_usuario]); 

    // Efecto para cargar las rutinas cuando cambiamos la disciplina en el desplegable
    useEffect(() => {
        if (disciplinaSeleccionada) {
            ClassRepository.getRutinasByDisciplina(disciplinaSeleccionada)
                .then(data => setRutinas(data))
                .catch(err => console.error("Error al cargar rutinas:", err));
        }
    }, [disciplinaSeleccionada]);

    // Arrancamos la carga inicial
    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    // Función para que el Admin guarde la clase
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
            cargarDatos(); // Recargamos para verla en la lista
        } catch (err) {
            console.error(err);
            setError('Error al crear la clase. Revisa los datos.');
        }
    };

    // Función para que el Admin borre una clase si se equivoca
    const handleBorrarClase = async (id_clase: string) => {
        if (!window.confirm("¿Seguro que quieres borrar esta clase?")) return;
        try {
            await ClassRepository.deleteClase(id_clase);
            cargarDatos();
        } catch (err) {
            console.error(err);
            setError("Error al borrar la clase.");
        }
    };

    // SOCIO RESERVA CLASE
    const handleReservar = async (id_clase: string) => {
        setError(null);
        setSuccessMessage(null);
        
        if (!profile?.id_usuario) return;

        try {
            await ClassRepository.reservarClase(id_clase, profile.id_usuario);
            setSuccessMessage("¡Plaza reservada con éxito! Te esperamos.");
            // Recargamos los datos para que el botón cambie a verde
            cargarDatos();
        } catch (err: unknown) { // ARREGLADO EL ERROR DEL ANY AQUI
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Error al intentar reservar la plaza.");
            }
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">

            {/* Cabecera y Botones de Pestañas */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-fitbox-text flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-fitbox-red" />
                        Horarios y Entrenamiento
                    </h1>
                    <p className="text-fitbox-text-muted mt-1">Consulta las clases disponibles y las rutinas semanales.</p>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant={vistaActiva === 'horarios' ? 'primary' : 'secondary'}
                        onClick={() => setVistaActiva('horarios')}
                    >
                        Calendario de Clases
                    </Button>
                    <Button
                        variant={vistaActiva === 'rutinas' ? 'primary' : 'secondary'}
                        onClick={() => setVistaActiva('rutinas')}
                    >
                        Rutinas Semanales
                    </Button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg">
                    {error}
                </div>
            )}

            {/* NUEVO: Mensaje de éxito al reservar */}
            {successMessage && (
                <div className="p-4 bg-green-500/10 border border-green-500/50 text-green-500 rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    {successMessage}
                </div>
            )}

            {/* PESTAÑA 1: HORARIOS */}
            {vistaActiva === 'horarios' && (
                <div className="space-y-4">
                    {isAdmin && (
                        <div className="flex justify-end">
                            <Button onClick={() => setIsCreando(true)}>+ Nueva Clase</Button>
                        </div>
                    )}

                    <div className="bg-fitbox-card border border-neutral-800 rounded-lg overflow-hidden">
                        <table className="w-full text-left text-sm text-fitbox-text">
                            <thead className="bg-neutral-800/50 text-fitbox-text-muted uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4">Horario</th>
                                    <th className="px-6 py-4">Disciplina</th>
                                    <th className="px-6 py-4">Monitor</th>
                                    <th className="px-6 py-4">Aforo</th>
                                    {/* NUEVO: El socio también ve la columna de acciones para reservar */}
                                    {(isAdmin || isSocio) && <th className="px-6 py-4 text-right">Acciones</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800">
                                {isLoading ? (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center">Cargando calendario...</td></tr>
                                ) : clases.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center">No hay clases programadas.</td></tr>
                                ) : (
                                    clases.map((clase) => {
                                        // NUEVO: Comprobamos si el socio ya tiene reservada esta clase
                                        const yaReservada = misReservasActivas.includes(clase.id_clase);

                                        return (
                                            <tr key={clase.id_clase} className="hover:bg-neutral-800/20 transition-colors">
                                                <td className="px-6 py-4 font-medium">{new Date(clase.fecha).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-fitbox-text-muted" />
                                                    {clase.hora_inicio.slice(0, 5)} - {clase.hora_fin.slice(0, 5)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-fitbox-red/20 text-fitbox-red px-2 py-1 rounded-md text-xs font-bold">
                                                        {clase.disciplinas?.nombre}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {clase.usuarios ? `${clase.usuarios.nombre} ${clase.usuarios.apellidos}` : 'Sin asignar'}
                                                </td>
                                                <td className="px-6 py-4 flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-fitbox-text-muted" />
                                                    {clase.aforo_maximo} pax
                                                </td>
                                                
                                                {/* NUEVO: Botones de acciones separados por rol */}
                                                {(isAdmin || isSocio) && (
                                                    <td className="px-6 py-4 text-right">
                                                        {isAdmin && (
                                                            <button onClick={() => handleBorrarClase(clase.id_clase)} className="text-red-500 hover:text-red-400">
                                                                <Trash2 className="w-5 h-5 inline" />
                                                            </button>
                                                        )}
                                                        
                                                        {isSocio && (
                                                            yaReservada ? (
                                                                <span className="text-green-500 text-xs font-bold flex items-center justify-end gap-1">
                                                                    <CheckCircle className="w-4 h-4" /> Apuntado
                                                                </span>
                                                            ) : (
                                                                <button 
                                                                    className="bg-fitbox-red text-white px-3 py-1 rounded-md text-xs font-bold hover:bg-fitbox-red-hover transition-colors"
                                                                    onClick={() => handleReservar(clase.id_clase)}
                                                                >
                                                                    Reservar
                                                                </button>
                                                            )
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* PESTAÑA 2: RUTINAS */}
            {vistaActiva === 'rutinas' && (
                <div className="space-y-6">
                    <div className="flex items-center gap-4 bg-fitbox-card p-4 rounded-lg border border-neutral-800">
                        <Dumbbell className="w-6 h-6 text-fitbox-red" />
                        <label className="font-medium">Selecciona tu deporte:</label>
                        <select
                            className="bg-neutral-900 border border-neutral-700 text-fitbox-text rounded-md px-3 py-2"
                            value={disciplinaSeleccionada}
                            onChange={(e) => setDisciplinaSeleccionada(e.target.value)}
                        >
                            {disciplinas.map(d => (
                                <option key={d.id_disciplina} value={d.id_disciplina}>{d.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rutinas.length === 0 ? (
                            <p className="text-fitbox-text-muted col-span-3">No hay rutinas pactadas para este deporte.</p>
                        ) : (
                            rutinas.map(rutina => (
                                <div key={rutina.id_rutina} className="bg-fitbox-card p-5 rounded-lg border border-neutral-800 space-y-3 shadow-lg">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-lg text-fitbox-red">{rutina.dia_semana}</h3>
                                    </div>
                                    <p className="font-semibold text-fitbox-text">{rutina.titulo}</p>
                                    <p className="text-sm text-fitbox-text-muted leading-relaxed">{rutina.descripcion}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* MODAL: Crear Clase (Solo Admin) */}
            {isCreando && isAdmin && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-fitbox-card border border-neutral-800 p-6 rounded-lg w-full max-w-md space-y-4">
                        <h3 className="text-xl font-bold">Programar Nueva Clase</h3>

                        <div className="space-y-2">
                            <label className="text-sm text-fitbox-text-muted">Deporte / Disciplina</label>
                            <select
                                className="w-full bg-neutral-900 border border-neutral-700 text-fitbox-text rounded-md px-3 py-2"
                                onChange={(e) => setNuevaClase({ ...nuevaClase, id_disciplina: e.target.value })}
                            >
                                <option value="">-- Selecciona --</option>
                                {disciplinas.map(d => <option key={d.id_disciplina} value={d.id_disciplina}>{d.nombre}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-fitbox-text-muted">Monitor (Opcional)</label>
                            <select
                                className="w-full bg-neutral-900 border border-neutral-700 text-fitbox-text rounded-md px-3 py-2"
                                onChange={(e) => setNuevaClase({ ...nuevaClase, id_monitor: e.target.value })}
                            >
                                <option value="">-- Sin asignar --</option>
                                {monitores.map(m => <option key={m.id_usuario} value={m.id_usuario}>{m.nombre} {m.apellidos}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-fitbox-text-muted">Fecha</label>
                                <input type="date" className="w-full bg-neutral-900 border border-neutral-700 text-fitbox-text rounded-md px-3 py-2" onChange={(e) => setNuevaClase({ ...nuevaClase, fecha: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-fitbox-text-muted">Aforo Máximo</label>
                                <input type="number" defaultValue={20} className="w-full bg-neutral-900 border border-neutral-700 text-fitbox-text rounded-md px-3 py-2" onChange={(e) => setNuevaClase({ ...nuevaClase, aforo_maximo: Number(e.target.value) })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-fitbox-text-muted">Hora Inicio</label>
                                <input type="time" className="w-full bg-neutral-900 border border-neutral-700 text-fitbox-text rounded-md px-3 py-2" onChange={(e) => setNuevaClase({ ...nuevaClase, hora_inicio: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-fitbox-text-muted">Hora Fin</label>
                                <input type="time" className="w-full bg-neutral-900 border border-neutral-700 text-fitbox-text rounded-md px-3 py-2" onChange={(e) => setNuevaClase({ ...nuevaClase, hora_fin: e.target.value })} />
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end mt-6">
                            <Button variant="ghost" onClick={() => setIsCreando(false)}>Cancelar</Button>
                            <Button onClick={handleCrearClase}>Guardar Clase</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};