import { useEffect, useReducer } from 'react';
import { useAuthStore } from '../store/authStore';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, AlertCircle, Activity, CreditCard, Clock, Dumbbell, Settings, ClipboardList, AlertTriangle } from 'lucide-react';
import { MachineRepository } from '../database/repositories/MachineRepository';
import { supabase } from '../database/supabase/Client';
import { OcupacionChart } from '../components/charts/OcupacionChart';
import '../styles/LoginPage.css';

interface ClaseDashboard {
    id_clase: string;
    hora_inicio: string;
    aforo_maximo: number;
    disciplinas: { nombre: string } | null;
    usuarios: { nombre: string } | null;
    reservas: { id: string }[];
}

interface DashboardState {
    incidencias: number;
    sociosCount: number;
    clasesCount: number;
    hombresCount: number;
    mujeresCount: number;
    proximasClases: ClaseDashboard[];
    isLoadingClases: boolean;
    datosOcupacion: { hora: string; ocupacion: number }[];
    mensajeOcupacion: { actual: number; recomendada: string; recomendadaOcup: number };
}

const initialState: DashboardState = {
    incidencias: 0,
    sociosCount: 0,
    clasesCount: 0,
    hombresCount: 0,
    mujeresCount: 0,
    proximasClases: [],
    isLoadingClases: true,
    datosOcupacion: [],
    mensajeOcupacion: { actual: 0, recomendada: '', recomendadaOcup: 0 }
};

export const DashboardPage = () => {
    const profile = useAuthStore((state) => state.profile);
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();

    const rol = profile?.roles?.nombre_rol || 'Socio';
    const isAdminOrMonitor = rol === 'Administrador' || rol === 'Monitor';
    const isActivo = (profile as any)?.estado_pago === 'activo';

    const [state, setState] = useReducer(
        (prev: DashboardState, next: Partial<DashboardState>) => ({ ...prev, ...next }),
        initialState
    );

    // Desestructuramos para que el HTML de abajo siga funcionando exactamente igual
    const {
        incidencias, sociosCount, clasesCount, hombresCount, mujeresCount,
        proximasClases, isLoadingClases, datosOcupacion, mensajeOcupacion
    } = state;

    useEffect(() => {
        let isMounted = true; // Evita memory leaks si el usuario cambia rápido de página

        MachineRepository.getAllMaquinas().then(data => {
            if (isMounted) setState({ incidencias: data.filter(maquina => maquina.estado !== 'Correcto').length });
        }).catch(err => console.error("Error al cargar incidencias:", err));

        const fetchSocios = async () => {
            const { count, error } = await supabase.from('usuarios').select('*', { count: 'exact', head: true });
            if (!error && count !== null && isMounted) setState({ sociosCount: count });
        };

        const fetchEstadisticasSexos = async () => {
            const { count: h } = await supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('sexo', 'Hombre');
            const { count: m } = await supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('sexo', 'Mujer');
            if (isMounted) setState({ hombresCount: h || 0, mujeresCount: m || 0 });
        };

        const fetchClasesHoy = async () => {
            if (isMounted) setState({ isLoadingClases: true });
            const hoy = new Date().toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('clases')
                .select(`
                    id_clase,
                    hora_inicio,
                    aforo_maximo,
                    disciplinas ( nombre ),
                    usuarios ( nombre ),
                    reservas ( id )
                `)
                .eq('fecha', hoy)
                .order('hora_inicio', { ascending: true });

            if (!error && data && isMounted) {
                const buckets = [8, 10, 12, 14, 16, 18, 20, 22];
                const ocupacionArr = buckets.map(b => ({
                    hora: `${b < 10 ? '0' + b : b}:00`,
                    ocupacion: 0,
                    plazas: 0,
                    reservas: 0
                }));

                data.forEach((clase: any) => {
                    if (!clase.hora_inicio) return;
                    const horaNum = parseInt(clase.hora_inicio.split(':')[0], 10);
                    let bucketVal = horaNum % 2 === 0 ? horaNum : horaNum - 1;
                    if (bucketVal < 8) bucketVal = 8;
                    if (bucketVal > 22) bucketVal = 22;

                    const bucketObj = ocupacionArr.find(b => b.hora === `${bucketVal < 10 ? '0' + bucketVal : bucketVal}:00`);
                    if (bucketObj) {
                        bucketObj.plazas += (clase.aforo_maximo || 20);
                        bucketObj.reservas += (clase.reservas ? clase.reservas.length : 0);
                    }
                });

                ocupacionArr.forEach(item => {
                    if (item.plazas > 0) {
                        item.ocupacion = Math.round((item.reservas / item.plazas) * 100);
                    }
                });

                const horaActualNum = new Date().getHours();
                let bucketActual = horaActualNum % 2 === 0 ? horaActualNum : horaActualNum - 1;
                if (bucketActual < 8) bucketActual = 8;
                if (bucketActual > 22) bucketActual = 22;

                const actualObj = ocupacionArr.find(b => b.hora === `${bucketActual < 10 ? '0' + bucketActual : bucketActual}:00`);
                const ocupacionActual = actualObj ? actualObj.ocupacion : 0;

                let mejorHora = '';
                let menorOcupacion = 100;
                ocupacionArr.forEach(item => {
                    const itemHoraNum = parseInt(item.hora.split(':')[0], 10);
                    if (itemHoraNum > horaActualNum && item.ocupacion <= menorOcupacion) {
                        menorOcupacion = item.ocupacion;
                        mejorHora = item.hora;
                    }
                });

                if (!mejorHora) {
                    mejorHora = '08:00 (Mañana)';
                    menorOcupacion = 0;
                }

                setState({
                    clasesCount: data.length,
                    proximasClases: data.slice(0, 4) as unknown as ClaseDashboard[],
                    datosOcupacion: ocupacionArr,
                    mensajeOcupacion: {
                        actual: ocupacionActual,
                        recomendada: mejorHora,
                        recomendadaOcup: menorOcupacion
                    },
                    isLoadingClases: false
                });
            } else if (isMounted) {
                setState({ isLoadingClases: false });
            }
        };

        fetchSocios();
        fetchEstadisticasSexos();
        fetchClasesHoy();

        return () => { isMounted = false; };
    }, []);

    return (
        <div className="relative w-full pb-12">
            <div className="fixed inset-0 bg-neutral-950 z-[-2]"></div>
            <div className="fixed inset-0 bg-linear-to-br from-neutral-950 via-neutral-900/20 to-neutral-950 z-[-1] pointer-events-none"></div>
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-150 md:w-250 h-125 bg-neutral-800/10 rounded-full blur-[120px] pointer-events-none z-[-1]"></div>
            <div className="fixed inset-0 opacity-[0.03] z-[-1] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>

            {!isAdminOrMonitor && !isActivo ? (
                <div className="p-8 text-center flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in duration-500 relative z-10">
                    <AlertCircle className="w-24 h-24 text-fitbox-red mb-6 opacity-80 animate-pulse" />
                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">ACCESO RESTRINGIDO</h2>
                    <p className="text-gray-400 max-w-lg mb-8 text-lg">
                        Tu suscripción se encuentra inactiva o pendiente de renovación. Por favor, regulariza tu situación en la pasarela de pagos para volver a disfrutar del club.
                    </p>
                    <Button onClick={() => navigate('/pagos')} className="bg-fitbox-red hover:bg-red-700 text-white font-black py-6 px-8 text-lg shadow-lg shadow-fitbox-red/20">
                        <CreditCard className="w-5 h-5 mr-2" />
                        Abonar Cuota Ahora
                    </Button>
                </div>
            ) : (
                <div className="p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-neutral-800/50 pb-4 animate-fade-in-down">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase">
                                Panel de <span className="text-fitbox-red">{isAdminOrMonitor ? 'Control' : 'Atleta'}</span>
                            </h1>
                            <p className="text-sm text-gray-400 mt-1 font-medium">
                                Bienvenido/a, <span className="text-white capitalize">{profile?.nombre || user?.email?.split('@')[0]}</span>.
                                {isAdminOrMonitor ? ' Visión general del estado del centro.' : ' Prepárate para entrenar.'}
                            </p>
                        </div>

                        {!isAdminOrMonitor && (
                            <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border backdrop-blur-md shadow-lg ${isActivo ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'} animate-fade-in-up`}>
                                <div className={`p-1.5 rounded-full ${isActivo ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-fitbox-red'}`}>
                                    <CreditCard className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Membresía</p>
                                    <p className={`text-xs font-black uppercase tracking-widest ${isActivo ? 'text-green-400' : 'text-fitbox-red'}`}>
                                        {isActivo ? 'Activa' : 'Pendiente Pago'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-xl p-4 shadow-lg hover:bg-neutral-800/50 transition-colors animate-fade-in-up card-animate glow-red" style={{animationDelay: '0ms'}}>
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Total Socios</span>
                                <Users className="h-4 w-4 text-fitbox-red" />
                            </div>
                            <div className="text-2xl font-black text-white">{sociosCount}</div>
                        </div>

                        <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-xl p-4 shadow-lg hover:bg-neutral-800/50 transition-colors animate-fade-in-up card-animate glow-red" style={{animationDelay: '100ms'}}>
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Clases Hoy</span>
                                <Calendar className="h-4 w-4 text-fitbox-red" />
                            </div>
                            <div className="text-2xl font-black text-white">{clasesCount}</div>
                        </div>

                        <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-xl p-4 shadow-lg hover:bg-neutral-800/50 transition-colors animate-fade-in-up card-animate glow-red" style={{animationDelay: '200ms'}}>
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Incidencias</span>
                                <AlertCircle className={`h-4 w-4 ${incidencias > 0 ? 'text-fitbox-red animate-pulse' : 'text-green-500'}`} />
                            </div>
                            <div className={`text-2xl font-black ${incidencias > 0 ? 'text-fitbox-red' : 'text-green-400'}`}>
                                {incidencias}
                            </div>
                        </div>

                        <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-xl p-4 shadow-lg hover:bg-neutral-800/50 transition-colors animate-fade-in-up card-animate glow-red" style={{animationDelay: '300ms'}}>
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Hombres</span>
                                <Activity className="h-4 w-4 text-blue-500/70" />
                            </div>
                            <div className="text-2xl font-black text-white">{hombresCount}</div>
                        </div>

                        <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-xl p-4 shadow-lg hover:bg-neutral-800/50 transition-colors animate-fade-in-up card-animate glow-red" style={{animationDelay: '400ms'}}>
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Mujeres</span>
                                <Activity className="h-4 w-4 text-purple-500/70" />
                            </div>
                            <div className="text-2xl font-black text-white">{mujeresCount}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                        <div className="xl:col-span-8 space-y-6 animate-fade-in-up" style={{animationDelay: '200ms'}}>
                            <div className="bg-neutral-900/40 backdrop-blur-2xl border border-neutral-700 p-6 rounded-2xl shadow-xl h-full flex flex-col hover:border-neutral-600 transition-all">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
                                    <h3 className="text-white font-black text-lg uppercase tracking-tight flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-fitbox-red" /> Estado y Afluencia de la Sala
                                    </h3>

                                    <div className={`px-3 py-1.5 rounded-lg border backdrop-blur-sm ${mensajeOcupacion.actual > 70 ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                                        <p className="text-[11px] font-bold text-gray-300">
                                            {mensajeOcupacion.actual > 70 ? (
                                                <><span className="text-fitbox-red">Muy lleno ({mensajeOcupacion.actual}%).</span> Mejor a las {mensajeOcupacion.recomendada}.</>
                                            ) : (
                                                <><span className="text-green-400">Tranquilo ({mensajeOcupacion.actual}%).</span> Buen momento para entrenar.</>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-1 min-h-75 border border-white/5 bg-neutral-950/30 p-4 rounded-xl flex items-center justify-center">
                                    <OcupacionChart data={datosOcupacion} />
                                </div>
                            </div>
                        </div>

                        <div className="xl:col-span-4 space-y-6 animate-fade-in-up" style={{animationDelay: '300ms'}}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
                                {rol === 'Administrador' ? (
                                    <>
                                        <Button
                                            onClick={() => navigate('/socios')}
                                            className="w-full h-16 bg-fitbox-red hover:bg-red-700 text-white font-black text-lg italic uppercase tracking-widest shadow-lg shadow-fitbox-red/20 transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 rounded-xl btn-glow"
                                        >
                                            <Users className="w-5 h-5" /> Gestión Socios
                                        </Button>

                                        <Button
                                            onClick={() => navigate('/maquinas')}
                                            className="w-full h-16 bg-neutral-800 backdrop-blur-xl hover:bg-neutral-700 text-white font-black text-lg italic uppercase tracking-widest border border-neutral-700 shadow-lg transition-all hover:border-neutral-600 hover:scale-[1.02] flex items-center justify-center gap-2 rounded-xl"
                                        >
                                            <Settings className="w-5 h-5" /> Ver Inventario
                                        </Button>
                                    </>
                                ) : rol === 'Monitor' ? (
                                    <>
                                        <Button
                                            onClick={() => navigate('/clases')}
                                            className="w-full h-16 bg-fitbox-red hover:bg-red-700 text-white font-black text-lg italic uppercase tracking-widest shadow-lg shadow-fitbox-red/20 transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 rounded-xl btn-glow"
                                        >
                                            <ClipboardList className="w-5 h-5" /> Pasar Lista
                                        </Button>

                                        <Button
                                            onClick={() => navigate('/maquinas')}
                                            className="w-full h-16 bg-neutral-800 backdrop-blur-xl hover:bg-neutral-700 text-white font-black text-lg italic uppercase tracking-widest border border-neutral-700 shadow-lg transition-all hover:border-neutral-600 hover:scale-[1.02] flex items-center justify-center gap-2 rounded-xl"
                                        >
                                            <AlertTriangle className="w-5 h-5" /> Reportar Avería
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            onClick={() => navigate('/clases')}
                                            className="w-full h-16 bg-fitbox-red hover:bg-red-700 text-white font-black text-lg italic uppercase tracking-widest shadow-lg shadow-fitbox-red/20 transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 rounded-xl btn-glow"
                                        >
                                            <Calendar className="w-5 h-5" /> Reservar
                                        </Button>

                                        <Button
                                            onClick={() => navigate('/maquinas')}
                                            className="w-full h-16 bg-neutral-800 backdrop-blur-xl hover:bg-neutral-700 text-white font-black text-lg italic uppercase tracking-widest border border-neutral-700 shadow-lg transition-all hover:border-neutral-600 hover:scale-[1.02] flex items-center justify-center gap-2 rounded-xl"
                                        >
                                            <Dumbbell className="w-5 h-5" /> Máquinas
                                        </Button>
                                    </>
                                )}
                            </div>

                            <div className="bg-neutral-900/40 backdrop-blur-2xl border border-neutral-700 p-5 md:p-6 rounded-2xl shadow-xl h-full hover:border-neutral-600 transition-all">
                                <h3 className="text-white font-black text-sm uppercase tracking-tight mb-4 flex items-center gap-2 border-b border-neutral-700 pb-3">
                                    <Clock className="w-4 h-4 text-fitbox-red" /> Hoy en FITBOX
                                </h3>

                                <div className="space-y-3">
                                    {isLoadingClases ? (
                                        <div className="space-y-2">
                                            {[1, 2, 3].map(num => (
                                                <div key={`skeleton-${num}`} className="h-16 bg-neutral-800/50 animate-pulse rounded-xl border border-white/5"></div>
                                            ))}
                                        </div>
                                    ) : proximasClases.length === 0 ? (
                                        <p className="text-gray-500 text-xs italic text-center py-8 bg-neutral-950/30 rounded-xl border border-white/5">No hay clases programadas para hoy.</p>
                                    ) : (
                                        proximasClases.map((clase, idx) => {
                                            const disciplina = clase.disciplinas?.nombre || 'Clase General';
                                            const monitor = clase.usuarios?.nombre || 'Sin asignar';
                                            const horaFormateada = clase.hora_inicio ? clase.hora_inicio.substring(0, 5) : '--:--';
                                            const ocupacion = clase.reservas ? clase.reservas.length : 0;
                                            const maximo = clase.aforo_maximo || 20;
                                            const estaLlena = ocupacion >= maximo;

                                            return (
                                                <div key={clase.id_clase} className="group relative flex items-center p-3 bg-neutral-950/50 rounded-xl border border-white/5 hover:border-fitbox-red/50 hover:bg-neutral-900 transition-all cursor-pointer overflow-hidden animate-fade-in-up" style={{animationDelay: `${idx * 50}ms`}}>
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-fitbox-red opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                                    <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-white/5 flex flex-col items-center justify-center shrink-0 mr-3 group-hover:border-fitbox-red/30 transition-colors">
                                                        <span className="text-white font-black text-sm leading-none">{horaFormateada}</span>
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white font-black text-sm uppercase tracking-tight truncate group-hover:text-fitbox-red transition-colors">{disciplina}</p>
                                                        <p className="text-[10px] text-gray-500 font-medium truncate mt-0.5">
                                                            Por <span className="text-gray-300 group-hover:text-white transition-colors">{monitor}</span>
                                                        </p>
                                                    </div>

                                                    <div className="text-right ml-3 shrink-0">
                                                        <span className={`block font-black text-base leading-none mb-0.5 ${estaLlena ? 'text-fitbox-red' : 'text-green-400'}`}>
                                                            {ocupacion}/{maximo}
                                                        </span>
                                                        <p className="text-[8px] uppercase tracking-widest text-gray-500 font-bold">Plazas</p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};