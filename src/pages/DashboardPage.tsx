import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom'; 
import { Users, Calendar, AlertCircle } from 'lucide-react';

export const DashboardPage = () => {
    // Sacamos los datos del usuario logueado
    const profile = useAuthStore((state) => state.profile);
    const navigate = useNavigate();

    return (
        <div className="p-6 w-full max-w-7xl mx-auto">
            
            {/* 1. TÍTULO Y BIENVENIDA */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">
                    Hola, <span className="text-fitbox-red">{profile?.nombre}</span>
                </h1>
                <p className="text-gray-400">Este es el resumen de tu centro deportivo hoy.</p>
            </div>

            {/* 2. TARJETAS DE MÉTRICAS (Las 3 de arriba) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                
                {/* Tarjeta Socios */}
                <Card className="bg-[#1a1a1a] border-neutral-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <span className="text-sm font-medium text-gray-400">SOCIOS</span>
                        <Users className="h-5 w-5 text-fitbox-red" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">124</div>
                    </CardContent>
                </Card>

                {/* Tarjeta Clases */}
                <Card className="bg-[#1a1a1a] border-neutral-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <span className="text-sm font-medium text-gray-400">CLASES HOY</span>
                        <Calendar className="h-5 w-5 text-fitbox-red" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">8</div>
                    </CardContent>
                </Card>

                {/* Tarjeta Incidencias */}
                <Card className="bg-[#1a1a1a] border-neutral-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <span className="text-sm font-medium text-gray-400">INCIDENCIAS</span>
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">2</div>
                    </CardContent>
                </Card>

            </div>

            {/* 3. HORARIO Y ACCESOS (Parte de abajo) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Lista de clases para hoy */}
                <div className="bg-[#1a1a1a] p-5 rounded-xl border border-neutral-800">
                    <h3 className="text-white font-bold mb-4">Próximas Clases</h3>
                    <div className="space-y-4">
                        {/* Clase 1 */}
                        <div className="flex justify-between items-center p-3 bg-neutral-900 rounded-lg">
                            <div>
                                <p className="text-white font-medium">Crossfit Avanzado</p>
                                <p className="text-xs text-gray-500">18:00 - Monitor: Carlos</p>
                            </div>
                            <span className="text-fitbox-red font-bold text-sm">5/20 plazas</span>
                        </div>
                        {/* Clase 2 */}
                        <div className="flex justify-between items-center p-3 bg-neutral-900 rounded-lg">
                            <div>
                                <p className="text-white font-medium">Yoga Relax</p>
                                <p className="text-xs text-gray-500">19:30 - Monitora: Ana</p>
                            </div>
                            <span className="text-green-500 font-bold text-sm">12/15 plazas</span>
                        </div>
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