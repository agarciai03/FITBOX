import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, AlertCircle, Activity, CreditCard } from 'lucide-react'; // <-- AÑADIDO: Nuevos iconos
import { MachineRepository } from '../database/repositories/MachineRepository';
import { supabase } from '../database/supabase/Client';

interface ClaseDashboard {
    id_clase: string;
    hora_inicio: string;
    aforo_maximo: number;
    disciplinas: { nombre: string } | null;
    usuarios: { nombre: string } | null; // El Monitor
    reservas: { id: string }[]; // Array con las reservas para poder contarlas
}

export const DashboardPage = () => {
    // Sacamos los datos del usuario logueado
    const profile = useAuthStore((state) => state.profile);
    const navigate = useNavigate();

    // Variables de estado para los contadores
    const [incidencias, setIncidencias] = useState(0);
    const [sociosCount, setSociosCount] = useState(0);
    const [clasesCount, setClasesCount] = useState(0);

    // <-- AÑADIDO: Estados para Boss 2 (KPIs de Hombres y Mujeres)
    const [hombresCount, setHombresCount] = useState(0);
    const [mujeresCount, setMujeresCount] = useState(0);

    // Estado para guardar la lista de clases reales de hoy
    const [proximasClases, setProximasClases] = useState<ClaseDashboard[]>([]);
    const [isLoadingClases, setIsLoadingClases] = useState(true);

    // Al cargar el Dashboard, pedimos los datos
    useEffect(() => {
        // 1. Incidencias
        MachineRepository.getAllMaquinas().then(data => {
            const maquinasRotas = data.filter(maquina => maquina.estado !== 'Correcto').length;
            setIncidencias(maquinasRotas);
        }).catch(err => console.error("Error al cargar las incidencias en el Dashboard:", err));

        // 2. Contar todos los usuarios
        const fetchSocios = async () => {
            const { count, error } = await supabase
                .from('usuarios')
                .select('*', { count: 'exact', head: true });
            if (!error && count !== null) {
                setSociosCount(count);
            }
        };

        // Contar hombres y mujeres para las nuevas estadísticas
        const fetchEstadisticasSexos = async () => {
            const { count: h } = await supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('sexo', 'Hombre');
            const { count: m } = await supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('sexo', 'Mujer');
            if (h !== null) setHombresCount(h);
            if (m !== null) setMujeresCount(m);
        };

        // Traer las clases completas de hoy con sus relaciones
        const fetchClasesHoy = async () => {
            setIsLoadingClases(true);
            const hoy = new Date().toISOString().split('T')[0]; // Saca formato 'YYYY-MM-DD'

            // Le pedimos a Supabase las clases uniendo las tablas de disciplinas, usuarios(monitor) y reservas
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
                .order('hora_inicio', { ascending: true }); // Ordenadas por hora

            if (!error && data) {
                setClasesCount(data.length); // Actualizamos la tarjeta de arriba
                // Nos guardamos solo las primeras 4 para no saturar la pantalla
                setProximasClases(data.slice(0, 4) as unknown as ClaseDashboard[]);
            }
            setIsLoadingClases(false);
        };

        fetchSocios();
        fetchEstadisticasSexos(); // Ejecutamos la carga de métricas nuevas
        fetchClasesHoy();
    }, []);

    return (
        <div className="p-6 w-full max-w-7xl mx-auto">

            {/* 1. TÍTULO Y BIENVENIDA */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">
                    Hola, <span className="text-fitbox-red">{profile?.nombre}</span>
                </h1>
                <p className="text-gray-400">Este es el resumen de tu centro deportivo hoy.</p>
            </div>

            {/* <-- AÑADIDO: MEMBRESÍA (SOLO PARA SOCIOS) --> */}
            {profile?.roles?.nombre_rol === 'Socio' && (
                <Card className={`mb-8 p-6 flex flex-col justify-center items-center border ${(profile as any)?.estado_pago === 'activo' ? 'bg-green-900/10 border-green-500/30' : 'bg-red-900/10 border-red-500/30'}`}>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <CreditCard className="w-5 h-5" /> Estado de Suscripción
                    </h3>
                    <p className={`text-4xl font-black uppercase tracking-tighter ${(profile as any)?.estado_pago === 'activo' ? 'text-green-500' : 'text-fitbox-red'}`}>
                        {(profile as any)?.estado_pago === 'activo' ? 'ACTIVA' : 'PENDIENTE DE PAGO'}
                    </p>
                </Card>
            )}

            {/* 2. TARJETAS DE MÉTRICAS */}
            {/* <-- MODIFICADO: Aumentamos a 5 columnas en pantallas grandes para encajar Hombres y Mujeres --> */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">

                <Card className="bg-[#1a1a1a] border-neutral-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <span className="text-sm font-medium text-gray-400">SOCIOS</span>
                        <Users className="h-5 w-5 text-fitbox-red" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{sociosCount}</div>
                    </CardContent>
                </Card>

                <Card className="bg-[#1a1a1a] border-neutral-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <span className="text-sm font-medium text-gray-400">CLASES HOY</span>
                        <Calendar className="h-5 w-5 text-fitbox-red" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{clasesCount}</div>
                    </CardContent>
                </Card>

                <Card className="bg-[#1a1a1a] border-neutral-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <span className="text-sm font-medium text-gray-400">INCIDENCIAS</span>
                        <AlertCircle className={`h-5 w-5 ${incidencias > 0 ? 'text-red-500' : 'text-green-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${incidencias > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {incidencias}
                        </div>
                    </CardContent>
                </Card>

                {/* <-- AÑADIDO: Nuevas tarjetas exclusivas para estadísticas (Boss 2) --> */}
                <Card className="bg-[#1a1a1a] border-neutral-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <span className="text-sm font-medium text-gray-400">HOMBRES</span>
                        <Activity className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{hombresCount}</div>
                    </CardContent>
                </Card>

                <Card className="bg-[#1a1a1a] border-neutral-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <span className="text-sm font-medium text-gray-400">MUJERES</span>
                        <Activity className="h-5 w-5 text-pink-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{mujeresCount}</div>
                    </CardContent>
                </Card>

            </div>

            {/* 3. HORARIO Y ACCESOS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Lista de clases para hoy (DINÁMICA) */}
                <div className="bg-[#1a1a1a] p-5 rounded-xl border border-neutral-800">
                    <h3 className="text-white font-bold mb-4">Próximas Clases</h3>
                    <div className="space-y-4">

                        {/* Renderizado dinámico de las clases */}
                        {isLoadingClases ? (
                            <p className="text-gray-500 text-sm">Cargando horario...</p>
                        ) : proximasClases.length === 0 ? (
                            <p className="text-gray-500 text-sm italic">No hay clases programadas para el día de hoy.</p>
                        ) : (
                            proximasClases.map((clase) => {
                                // Extraemos los datos con seguridad por si alguno viene vacío
                                const disciplina = clase.disciplinas?.nombre || 'Clase General';
                                const monitor = clase.usuarios?.nombre || 'Sin asignar';
                                const horaFormateada = clase.hora_inicio ? clase.hora_inicio.substring(0, 5) : '--:--';
                                const ocupacion = clase.reservas ? clase.reservas.length : 0;
                                const maximo = clase.aforo_maximo || 20;
                                const estaLlena = ocupacion >= maximo;

                                return (
                                    <div key={clase.id_clase} className="flex justify-between items-center p-3 bg-neutral-900 rounded-lg">
                                        <div>
                                            <p className="text-white font-medium">{disciplina}</p>
                                            <p className="text-xs text-gray-500">{horaFormateada} - Monitor: {monitor}</p>
                                        </div>
                                        {/* El color de las plazas cambia a rojo si la clase está llena */}
                                        <span className={`font-bold text-sm ${estaLlena ? 'text-fitbox-red' : 'text-green-500'}`}>
                                            {ocupacion}/{maximo} plazas
                                        </span>
                                    </div>
                                );
                            })
                        )}

                    </div>
                </div>

                {/* Botones de acción rápida */}
                <div className="space-y-4">
                    <Button
                        onClick={() => navigate('/clases')}
                        className="w-full h-16 bg-fitbox-red hover:bg-red-700 text-white font-bold text-lg"
                    >
                        RESERVAR CLASE
                    </Button>
                    <Button
                        onClick={() => navigate('/maquinas')}
                        className="w-full h-16 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-lg border border-neutral-700"
                    >
                        INVENTARIO / MÁQUINAS
                    </Button>
                </div>

            </div>
        </div>
    );
};