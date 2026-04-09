import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Sidebar } from '../components/layout/Sidebar';
import { useNavigate } from 'react-router-dom'; // Añadimos esto para que el botón funcione

export const DashboardPage = () => {
    const profile = useAuthStore((state) => state.profile);
    const navigate = useNavigate();

    return (
        <div className="flex flex-1">
            {/* Sidebar a la izquierda */}
            <Sidebar />

            {/* Contenido principal del Dashboard a la derecha */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">

                <div className="mb-8">
                    <h2 className="text-3xl font-extrabold text-white">
                        Panel de Control
                    </h2>
                    <p className="text-fitbox-text-muted mt-2">
                        Hola, <span className="text-white font-medium">{profile?.nombre}</span>.
                        Tienes nivel de acceso: <span className="text-fitbox-red font-bold">{profile?.roles?.nombre_rol}</span>
                    </p>
                </div>

                {/* Grid de Tarjetas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Nueva tarjeta útil conectada al Sprint 2 */}
                    <Card className="p-6">
                        <h3 className="text-xl font-bold text-white mb-2">Horarios y Clases</h3>
                        <p className="text-sm text-fitbox-text-muted mb-6">
                            Consulta los entrenamientos de esta semana y las rutinas.
                        </p>
                        <Button
                            variant="default"
                            className="w-full"
                            onClick={() => navigate('/clases')}
                        >
                            Ver Calendario
                        </Button>
                    </Card>

                </div>

            </div>
        </div>
    );
};