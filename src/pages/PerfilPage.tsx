import { useAuthStore } from '../store/authStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';

export const PerfilPage = () => {
    // Nos traemos el perfil del store (donde guardamos los datos de Supabase)
    const { profile } = useAuthStore();

    // Si por algún motivo tarda en cargar, mostramos esto
    if (!profile) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-white">Cargando perfil...</p>
            </div>
        );
    }

    // Extraemos la primera letra del nombre para el Avatar
    const inicial = profile.nombre ? profile.nombre.charAt(0).toUpperCase() : 'F';

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            <h1 className="text-3xl font-extrabold text-white mb-8">Mi Perfil</h1>

            <Card className="bg-fitbox-card border-neutral-800 shadow-xl">
                <CardHeader className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8">

                    {/* El Avatar de Shadcn: Círculo con la inicial */}
                    <Avatar className="h-24 w-24 border-2 border-fitbox-red">
                        <AvatarFallback className="bg-neutral-900 text-fitbox-red text-3xl font-bold">
                            {inicial}
                        </AvatarFallback>
                    </Avatar>

                    <div className="text-center sm:text-left space-y-1 mt-2">
                        <CardTitle className="text-3xl text-white tracking-tight">
                            {profile.nombre}
                        </CardTitle>
                        <CardDescription className="text-fitbox-text-muted text-lg capitalize">
                            {profile.roles?.nombre_rol || 'Socio'} de FITBOX
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-8">
                    {/* Sección de Datos Personales */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white border-b border-neutral-800 pb-2">
                            Datos de la Cuenta
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            {/* Campo: Correo */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-fitbox-text-muted">Correo Electrónico</Label>
                                <Input
                                    id="email"
                                    value={profile.email}
                                    readOnly
                                    className="bg-neutral-900/50 border-neutral-800 text-white cursor-default focus-visible:ring-0 focus-visible:border-neutral-700"
                                />
                            </div>

                            {/* Campo: Estado de la Cuenta */}
                            <div className="space-y-2">
                                <Label htmlFor="estado" className="text-fitbox-text-muted">Estado</Label>
                                <Input
                                    id="estado"
                                    value="Activo"
                                    readOnly
                                    className="bg-neutral-900/50 border-neutral-800 text-green-400 font-medium cursor-default focus-visible:ring-0 focus-visible:border-neutral-700"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};