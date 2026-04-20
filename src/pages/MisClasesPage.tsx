import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { AttendanceRepository } from '../database/repositories/AttendanceRepository';
import { ClassRepository, type Clase } from '../database/repositories/ClassRepository';
import { supabase } from '../database/supabase/Client';
import { ClipboardList, Clock, Calendar, Check, UserX, CheckCircle } from 'lucide-react';

export const MisClasesPage = () => {
    const profile = useAuthStore((state) => state.profile);
    const [misClases, setMisClases] = useState<Clase[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [ahora, setAhora] = useState(new Date());

    const cargarMisClases = useCallback(async () => {
        if (!profile?.id_usuario) return;
        try {
            if (misClases.length === 0) setIsLoading(true);
            const data = await AttendanceRepository.getClasesDelMonitor(profile.id_usuario);
            setMisClases(data);
        } catch (error) {
            console.error("Error al cargar las clases del monitor:", error);
        } finally {
            setIsLoading(false);
        }
    }, [profile?.id_usuario, misClases.length]);

    useEffect(() => {
        cargarMisClases();
    }, [cargarMisClases]);

    // Ticker para el reloj interno
    useEffect(() => {
        const interval = setInterval(() => setAhora(new Date()), 10000);
        return () => clearInterval(interval);
    }, []);

    // Conexión WebSockets para que los socios aparezcan en tiempo real al reservar
    useEffect(() => {
        const channel = supabase.channel('realtime-asistencia')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'reservas' }, cargarMisClases)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'clases' }, cargarMisClases)
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [cargarMisClases]);

    // Limpiador automático: Borra la clase 2 horas después de que termine para que dé tiempo a pasar lista
    useEffect(() => {
        if (misClases.length > 0) {
            const cleanup = async () => {
                const limiteBorrado = new Date(ahora.getTime() - 2 * 60 * 60 * 1000);
                for (const clase of misClases) {
                    const fechaFinClase = new Date(`${clase.fecha}T${clase.hora_fin}`);
                    if (fechaFinClase < limiteBorrado) {
                        try {
                            await ClassRepository.deleteClase(clase.id_clase);
                        } catch (e) {
                            console.error("Error auto-limpieza:", e);
                        }
                    }
                }
            };
            cleanup();
        }
    }, [misClases, ahora]);

    const handleAsistencia = async (id_reserva: string, asistio: boolean) => {
        try {
            await AttendanceRepository.marcarAsistencia(id_reserva, asistio);
            cargarMisClases(); // Recargamos para ver el cambio visual
        } catch (error) {
            console.error("Error al pasar lista:", error);
        }
    };

    if (profile?.roles?.nombre_rol !== 'Monitor' && profile?.roles?.nombre_rol !== 'Administrador') {
        return <div className="p-8 text-center text-red-500 font-bold">Acceso restringido a Staff.</div>;
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Cabecera */}
            <div>
                <h1 className="text-3xl font-extrabold text-white flex items-center gap-3 uppercase tracking-tight">
                    <ClipboardList className="w-8 h-8 text-fitbox-red" />
                    MIS CLASES <span className="text-fitbox-red">ASIGNADAS</span>
                </h1>
                <p className="text-fitbox-text-muted mt-1">Revisa tus sesiones y pasa lista de asistencia a los socios.</p>
            </div>

            {isLoading && misClases.length === 0 ? (
                <p className="text-gray-500 text-center py-12">Cargando tu cuadrante de clases...</p>
            ) : misClases.length === 0 ? (
                <div className="bg-fitbox-card border border-neutral-800 rounded-xl p-12 flex flex-col items-center text-center shadow-2xl">
                    <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-6 border border-neutral-800">
                        <CheckCircle className="w-10 h-10 text-gray-500" />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Día <span className="text-fitbox-red">Libre</span></h2>
                    <p className="text-gray-400">No tienes ninguna clase asignada a tu nombre en este momento.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {misClases.map((clase) => {
                        const reservasActivas = clase.reservas?.filter(r => r.estado === 'activa') || [];
                        const fechaFinClase = new Date(`${clase.fecha}T${clase.hora_fin}`);
                        const estaFinalizada = ahora > fechaFinClase;

                        return (
                            <div key={clase.id_clase} className={`bg-fitbox-card border rounded-xl overflow-hidden shadow-xl transition-all ${estaFinalizada ? 'border-neutral-800 opacity-80' : 'border-neutral-700 hover:border-fitbox-red/50'}`}>
                                {/* Encabezado de la Tarjeta de Clase */}
                                <div className={`p-4 border-b ${estaFinalizada ? 'bg-neutral-900/50 border-neutral-800' : 'bg-neutral-800/50 border-neutral-700'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="bg-fitbox-red text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            {clase.disciplinas?.nombre}
                                        </span>
                                        {estaFinalizada && (
                                            <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">FINALIZADA</span>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-gray-400" />
                                        {new Date(clase.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </h3>
                                    <p className="text-gray-400 flex items-center gap-2 mt-1">
                                        <Clock className="w-4 h-4 text-fitbox-red" />
                                        {clase.hora_inicio.slice(0, 5)} - {clase.hora_fin.slice(0, 5)} hrs.
                                    </p>
                                </div>

                                {/* Lista de Asistentes */}
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Lista de Asistentes</p>
                                        <p className="text-xs font-bold text-gray-400">{reservasActivas.length} / {clase.aforo_maximo} Plazas</p>
                                    </div>

                                    {reservasActivas.length === 0 ? (
                                        <p className="text-gray-500 italic text-sm text-center py-4">Nadie ha reservado plaza todavía.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {reservasActivas.map(reserva => (
                                                <div key={reserva.id} className="flex items-center justify-between bg-neutral-900 p-3 rounded-lg border border-neutral-800">
                                                    <div>
                                                        <p className="text-sm font-bold text-white uppercase">{reserva.usuarios?.nombre} {reserva.usuarios?.apellidos}</p>
                                                        <p className="text-[10px] text-gray-500">{reserva.usuarios?.email}</p>
                                                    </div>

                                                    {/* Botones de Asistencia */}
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleAsistencia(reserva.id, true)}
                                                            className={`p-2 rounded-md transition-colors ${reserva.asistencia === true ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-neutral-800 text-gray-500 hover:bg-green-500/10 hover:text-green-500'}`}
                                                            title="Marcar como Presente"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAsistencia(reserva.id, false)}
                                                            className={`p-2 rounded-md transition-colors ${reserva.asistencia === false ? 'bg-red-500/20 text-fitbox-red border border-red-500/30' : 'bg-neutral-800 text-gray-500 hover:bg-red-500/10 hover:text-fitbox-red'}`}
                                                            title="Marcar Falta"
                                                        >
                                                            <UserX className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};