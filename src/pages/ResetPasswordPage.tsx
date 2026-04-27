import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthRepository } from '../database/repositories/AuthRepository';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { ShieldCheck, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const { logout } = useAuthStore();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);

    // Alerta de error global (Solo para errores del servidor/enlace expirado)
    const [serverError, setServerError] = useState<string | null>(null);

    // Errores de validación en los inputs (reemplaza la Alerta)
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [confirmError, setConfirmError] = useState<string | null>(null);

    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError(null);
        setPasswordError(null);
        setConfirmError(null);

        let isValid = true;

        if (password.length < 6) {
            setPasswordError("La contraseña debe tener al menos 6 caracteres.");
            isValid = false;
        }
        if (password !== confirm) {
            setConfirmError("Las contraseñas no coinciden. Revisa los datos.");
            isValid = false;
        }

        if (!isValid) return;

        setLoading(true);
        try {
            await AuthRepository.updatePassword(password);
            await logout();
            setSuccess(true);
        } catch {
            setServerError("El enlace de recuperación es inválido o ha caducado. Vuelve a solicitar un enlace desde el login.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Fondo decorativo FITBOX */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#450a0a,transparent)] opacity-40 pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500">
                <Card className="p-8 shadow-2xl bg-neutral-950/90 border-neutral-800 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-fitbox-red via-red-600 to-red-900"></div>

                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-red-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-900/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                            <ShieldCheck className="text-fitbox-red w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Nueva <span className="text-fitbox-red">Contraseña</span></h1>
                        <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest font-bold">Establece tus credenciales de acceso</p>
                    </div>

                    {/* Alerta solo para errores del servidor */}
                    {serverError && <Alert type="error" message={serverError} />}

                    {success ? (
                        <div className="text-center py-4 space-y-6 animate-in slide-in-from-bottom-4">
                            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                <p className="text-sm text-gray-300 font-medium">¡Contraseña actualizada con éxito! Ya puedes acceder a tu cuenta.</p>
                            </div>
                            <Button onClick={() => navigate('/')} className="w-full bg-fitbox-red hover:bg-red-700 font-black py-6 text-lg shadow-lg">
                                IR AL LOGIN
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Contraseña Nueva</label>
                                <Input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`bg-neutral-900 text-white h-12 transition-all ${passwordError ? 'border-red-500 focus:border-red-500' : 'border-neutral-800 focus:border-fitbox-red'}`}
                                    placeholder="Mínimo 6 caracteres"
                                />
                                {passwordError && <span className="text-xs text-red-500 font-medium">{passwordError}</span>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Confirmar Contraseña</label>
                                <Input
                                    type="password"
                                    required
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    className={`bg-neutral-900 text-white h-12 transition-all ${confirmError ? 'border-red-500 focus:border-red-500' : 'border-neutral-800 focus:border-fitbox-red'}`}
                                    placeholder="Repite tu contraseña"
                                />
                                {confirmError && <span className="text-xs text-red-500 font-medium">{confirmError}</span>}
                            </div>
                            <div className="pt-4">
                                <Button type="submit" className="w-full bg-fitbox-red hover:bg-red-700 text-white font-black py-6 text-lg shadow-lg" disabled={loading}>
                                    {loading ? 'GUARDANDO...' : 'RESTABLECER AHORA'}
                                </Button>
                            </div>
                        </form>
                    )}
                </Card>
            </div>
        </div>
    );
};