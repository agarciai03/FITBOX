import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/Button';
import { LogOut } from 'lucide-react';

export const PerfilPage = () => {
    // Nos traemos también la función logout del store
    const { profile, logout } = useAuthStore();
    const navigate = useNavigate();

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

    // Función que se ejecuta al hacer clic en Cerrar Sesión
    const handleLogout = async () => {
        await logout(); // Borra la sesión de Supabase y del estado local
        navigate('/'); // Nos empuja directamente a la pantalla de Login
    };

    // Estilo reutilizable para los inputs de solo lectura
    const readOnlyInputStyle = "bg-neutral-900/80 border-neutral-800 text-white cursor-default focus-visible:ring-0 focus-visible:border-neutral-700";

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            <h1 className="text-3xl font-extrabold text-white mb-8">Mi Perfil</h1>

            <Card className="bg-fitbox-card border-neutral-800 shadow-xl overflow-hidden p-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-neutral-800 p-6 sm:p-8 bg-black/20">

                    {/* Agrupamos Avatar y Textos juntos a la izquierda */}
                    <div className="flex items-center gap-5 w-full sm:w-auto">

                        {/* El Avatar de Shadcn */}
                        <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-fitbox-red shrink-0 shadow-lg">
                            <AvatarFallback className="bg-neutral-900 text-fitbox-red text-2xl sm:text-3xl font-bold">
                                {inicial}
                            </AvatarFallback>
                        </Avatar>

                        {/* Textos del Perfil */}
                        <div className="space-y-1">
                            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                                {profile.nombre} {profile.apellidos}
                            </h2>
                            <p className="text-fitbox-text-muted text-sm sm:text-lg capitalize">
                                {profile.roles?.nombre_rol || 'Socio'} de FITBOX
                            </p>
                        </div>
                    </div>

                    {/* Botón de Cerrar Sesión a la derecha, perfectamente centrado */}
                    <Button
                        variant="destructive"
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 font-bold transition-colors shrink-0 w-full sm:w-auto shadow-md"
                    >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                    </Button>
                </div>

                <CardContent className="space-y-10 p-6 sm:p-8">

                    {/* BLOQUE 1: Datos de la Cuenta */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white border-b border-neutral-800 pb-2">
                            Cuenta y Seguridad
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="email" className="text-fitbox-text-muted font-bold text-xs uppercase tracking-wider">
                                    Correo Electrónico
                                </Label>
                                <Input
                                    id="email"
                                    value={profile.email || 'No especificado'}
                                    readOnly
                                    className={readOnlyInputStyle}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="estado" className="text-fitbox-text-muted font-bold text-xs uppercase tracking-wider">
                                    Estado
                                </Label>
                                <Input
                                    id="estado"
                                    value="Activo"
                                    readOnly
                                    className="bg-green-500/10 border-green-500/20 text-green-400 font-bold cursor-default focus-visible:ring-0 focus-visible:border-green-500/20"
                                />
                            </div>
                        </div>
                    </div>

                    {/* BLOQUE 2: Información Personal */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white border-b border-neutral-800 pb-2">
                            Información Personal
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="nombre" className="text-fitbox-text-muted font-bold text-xs uppercase tracking-wider">
                                    Nombre
                                </Label>
                                <Input
                                    id="nombre"
                                    value={profile.nombre || 'No especificado'}
                                    readOnly
                                    className={readOnlyInputStyle}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="apellidos" className="text-fitbox-text-muted font-bold text-xs uppercase tracking-wider">
                                    Apellidos
                                </Label>
                                <Input
                                    id="apellidos"
                                    value={profile.apellidos || 'No especificado'}
                                    readOnly
                                    className={readOnlyInputStyle}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dni" className="text-fitbox-text-muted font-bold text-xs uppercase tracking-wider">
                                    DNI / NIE
                                </Label>
                                <Input
                                    id="dni"
                                    value={profile.dni || 'No especificado'}
                                    readOnly
                                    className={readOnlyInputStyle}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sexo" className="text-fitbox-text-muted font-bold text-xs uppercase tracking-wider">
                                    Sexo
                                </Label>
                                <Input
                                    id="sexo"
                                    value={profile.sexo || 'No especificado'}
                                    readOnly
                                    className="bg-neutral-900/80 border-neutral-800 text-white capitalize cursor-default focus-visible:ring-0 focus-visible:border-neutral-700"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="telefono" className="text-fitbox-text-muted font-bold text-xs uppercase tracking-wider">
                                    Teléfono de Contacto
                                </Label>
                                <Input
                                    id="telefono"
                                    value={profile.telefono || 'No especificado'}
                                    readOnly
                                    className={readOnlyInputStyle}
                                />
                            </div>
                        </div>
                    </div>

                    {/* BLOQUE 3: Dirección */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white border-b border-neutral-800 pb-2">
                            Ubicación
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                            <div className="space-y-2 lg:col-span-2">
                                <Label htmlFor="pais" className="text-fitbox-text-muted font-bold text-xs uppercase tracking-wider">
                                    País
                                </Label>
                                <Input
                                    id="pais"
                                    value={profile.pais || 'No especificado'}
                                    readOnly
                                    className={readOnlyInputStyle}
                                />
                            </div>

                            <div className="space-y-2 lg:col-span-2">
                                <Label htmlFor="provincia" className="text-fitbox-text-muted font-bold text-xs uppercase tracking-wider">
                                    Provincia
                                </Label>
                                <Input
                                    id="provincia"
                                    value={profile.provincia || 'No especificado'}
                                    readOnly
                                    className={readOnlyInputStyle}
                                />
                            </div>

                            <div className="space-y-2 lg:col-span-3">
                                <Label htmlFor="localidad" className="text-fitbox-text-muted font-bold text-xs uppercase tracking-wider">
                                    Localidad / Ciudad
                                </Label>
                                <Input
                                    id="localidad"
                                    value={profile.localidad || 'No especificado'}
                                    readOnly
                                    className={readOnlyInputStyle}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cp" className="text-fitbox-text-muted font-bold text-xs uppercase tracking-wider">
                                    Código Postal
                                </Label>
                                <Input
                                    id="cp"
                                    value={profile.codigo_postal || 'No especificado'}
                                    readOnly
                                    className={readOnlyInputStyle}
                                />
                            </div>
                        </div>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
};