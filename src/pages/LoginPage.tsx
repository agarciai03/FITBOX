import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../database/supabase/Client';
import { useAuthStore } from '../store/authStore';

import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { REGEX } from '../utils/regex';
import { Dumbbell, Flame, Users, CalendarCheck, X, CheckCircle, Mail, TrendingUp, Shield, Clock, Zap, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { RegisterPage } from './RegisterPage';
import { AuthRepository } from '../database/repositories/AuthRepository';
import { Footer } from '../components/layout/Footer';
import '../styles/LoginPage.css';

interface LoginFormInputs {
    email: string;
    password: string;
}

export const LoginPage = () => {
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
    
    const [isPendingLogin, startTransitionLogin] = useTransition();
    const [isPendingReset, startTransitionReset] = useTransition();

    const [authError, setAuthError] = useState<string | null>(null);

    const { register, handleSubmit } = useForm<LoginFormInputs>();

    const onSubmit = (data: LoginFormInputs) => {
        setAuthError(null);
        startTransitionLogin(async () => {
            try {
                const { data: authData, error } = await supabase.auth.signInWithPassword({
                    email: data.email,
                    password: data.password,
                });

                if (error) throw error;
                if (authData.user) {
                    await setUser(authData.user);
                    navigate('/dashboard');
                }
            } catch (error: any) {
                if (error.message?.includes('Invalid login credentials')) {
                    setAuthError("Correo electrónico o contraseña incorrectos.");
                } else {
                    setAuthError("Error al iniciar sesión. Inténtalo de nuevo.");
                }
            }
        });
    };

    const handleResetPassword = (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError(null);
        
        startTransitionReset(async () => {
            try {
                await AuthRepository.sendResetPasswordEmail(resetEmail);
                setResetSuccess(true);
            } catch {
                setAuthError("No se pudo enviar el correo de recuperación. Verifica el email.");
            }
        });
    };

    return (
        <div className="min-h-screen bg-neutral-950 flex flex-col relative overflow-hidden">
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-150 md:w-250 h-125 bg-fitbox-red/20 rounded-full blur-[120px] pointer-events-none animate-in fade-in duration-1000"></div>

            <main className="relative z-10 grow flex flex-col items-center justify-center px-4 pt-20 pb-32">
                <div className="text-center space-y-6 max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/30 border border-red-900/50 rounded-full text-fitbox-red text-xs font-bold uppercase tracking-widest animate-fade-in-up">
                        <Flame className="size-3" />
                        Tu mejor versión empieza aquí
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black text-white italic uppercase tracking-tighter leading-none animate-slide-up">
                        FIT<span className="text-fitbox-red text-shadow-red">BOX</span>
                    </h1>

                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-medium animate-fade-in-up animate-delay-200">
                        Entrenamiento de élite, tecnología de vanguardia y una comunidad imparable. Únete al club más exclusivo.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-fade-in-up animate-delay-300">
                        <Button
                            onClick={() => setShowRegisterModal(true)}
                            className="bg-fitbox-red hover:bg-red-700 text-white font-black px-10 py-7 text-xl rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all hover:scale-105 btn-glow"
                        >
                            EMPEZAR AHORA
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowLoginModal(true)}
                            className="bg-transparent border-neutral-800 text-white hover:bg-neutral-900 px-10 py-7 text-xl rounded-2xl font-bold hover-glow"
                        >
                            ACCESO SOCIOS
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-32 w-full max-w-6xl">
                    {[
                        { icon: Dumbbell, label: "Equipamiento Pro", val: "Premium" },
                        { icon: Users, label: "Comunidad", val: "+500" },
                        { icon: CalendarCheck, label: "Clases Diarias", val: "24h" },
                        { icon: Flame, label: "Intensidad", val: "100%" }
                    ].map((item, idx) => (
                        <div key={item.label} className={`flex flex-col items-center gap-2 p-6 rounded-3xl bg-neutral-900/40 border border-neutral-800/50 backdrop-blur-sm animate-fade-in-up hover-lift`} style={{animationDelay: `${idx * 100}ms`}}>
                            <item.icon className="size-8 text-fitbox-red mb-2" />
                            <span className="text-white font-black uppercase text-xl italic">{item.val}</span>
                            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">{item.label}</span>
                        </div>
                    ))}
                </div>

                {/* SECCIÓN: POR QUÉ ELEGIR FITBOX */}
                <div className="mt-40 w-full max-w-6xl">
                    <h2 className="text-4xl md:text-5xl font-black text-white text-center uppercase tracking-tight mb-16 italic animate-fade-in-up">
                        Por qué elegir <span className="text-fitbox-red">FITBOX</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Shield, title: "Entrenamiento Personalizado", desc: "Programas diseñados por monitores certificados adaptados a tu nivel actual" },
                            { icon: TrendingUp, title: "Seguimiento Real", desc: "Registra tu progreso con métricas reales de tus entrenamientos" },
                            { icon: Clock, title: "Horarios Flexibles", desc: "Clases disponibles en horarios variados para adaptarse a tu rutina" },
                            { icon: Users, title: "Ambiente Motivador", desc: "Entrena con gente comprometida que comparte tus objetivos de fitness" },
                            { icon: Zap, title: "Sistema Moderno", desc: "Plataforma para reservar clases y gestionar tu membresía fácilmente" },
                            { icon: Star, title: "Monitores Certificados", desc: "Profesionales que te enseñarán la técnica correcta en cada ejercicio" }
                        ].map((item, idx) => (
                            <div key={idx} className={`p-8 rounded-2xl bg-neutral-900/50 border border-neutral-700 hover-lift hover:border-neutral-600 animate-fade-in-up`} style={{animationDelay: `${idx * 80}ms`}}>
                                <item.icon className="size-10 text-fitbox-red mb-4" />
                                <h3 className="text-white font-black uppercase text-lg mb-2">{item.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SECCIÓN: PLANES */}
                <div className="mt-40 w-full max-w-4xl">
                    <h2 className="text-4xl md:text-5xl font-black text-white text-center uppercase tracking-tight mb-16 italic animate-fade-in-up">
                        Plan de <span className="text-fitbox-red">Membresía</span>
                    </h2>
                    <div className="flex justify-center animate-scale-in">
                        <div className="p-8 rounded-2xl border-2 border-neutral-700 bg-neutral-900/60 shadow-lg w-full max-w-sm hover-lift hover:border-neutral-600 transition-all">
                            <h3 className="text-fitbox-red font-black uppercase text-2xl mb-2">Membresía Mensual</h3>
                            <p className="text-white font-black text-4xl mb-6">19.99€<span className="text-sm text-gray-400">/mes</span></p>
                            <ul className="space-y-3 mb-8">
                                {["Acceso a todas las clases", "Reservas online disponibles", "Estadísticas de entrenamientos", "Soporte de monitores"].map((feat, i) => (
                                    <li key={i} className="text-gray-300 text-sm flex items-start gap-2 animate-fade-in-up" style={{animationDelay: `${i * 50 + 200}ms`}}>
                                        <CheckCircle className="size-4 text-fitbox-red mt-0.5 shrink-0" />
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                            <Button onClick={() => setShowRegisterModal(true)} className="w-full font-bold py-4 bg-fitbox-red hover:bg-red-700 btn-glow">
                                Seleccionar Plan
                            </Button>
                        </div>
                    </div>
                </div>

                {/* SECCIÓN: TESTIMONIOS */}
                <div className="mt-40 w-full max-w-6xl">
                    <h2 className="text-4xl md:text-5xl font-black text-white text-center uppercase tracking-tight mb-16 italic animate-fade-in-up">
                        Historias de <span className="text-fitbox-red">Transformación</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { name: "Carlos M.", role: "Socio desde hace 1 año", quote: "Los monitores son muy atentos. He mejorado bastante mi forma física y me siento mejor." },
                            { name: "Laura P.", role: "Socio hace 8 meses", quote: "Me encanta el ambiente del gym. Los horarios son flexibles y siempre hay alguien disponible para ayudarte." },
                            { name: "Miguel D.", role: "Nuevo socio", quote: "Buena experiencia hasta ahora. El precio está bien y el equipo está en buen estado." }
                        ].map((testimonial, idx) => (
                            <div key={idx} className={`p-8 rounded-2xl bg-neutral-900/50 border border-neutral-700 hover-lift hover:border-neutral-600 animate-fade-in-up`} style={{animationDelay: `${idx * 100}ms`}}>
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="size-4 fill-fitbox-red text-fitbox-red" />)}
                                </div>
                                <p className="text-gray-300 italic mb-4">"{testimonial.quote}"</p>
                                <div className="border-t border-fitbox-red/20 pt-4">
                                    <p className="text-white font-black uppercase">{testimonial.name}</p>
                                    <p className="text-fitbox-red text-xs font-bold uppercase tracking-wider">{testimonial.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SECCIÓN: FAQ */}
                <div className="mt-40 w-full max-w-4xl">
                    <h2 className="text-4xl md:text-5xl font-black text-white text-center uppercase tracking-tight mb-16 italic animate-fade-in-up">
                        Preguntas <span className="text-fitbox-red">Frecuentes</span>
                    </h2>
                    <div className="space-y-4">
                        {[
                            { q: "¿Cuál es el compromiso de permanencia?", a: "No hay permanencia mínima. Puedes cancelar tu membresía en cualquier momento desde tu cuenta." },
                            { q: "¿Qué incluye la membresía?", a: "Acceso a todas las clases, uso completo de las instalaciones, acceso a estadísticas de entrenamientos y soporte de los monitores." },
                            { q: "¿Puedo cambiar de horarios?", a: "Claro, puedes reservar en los horarios disponibles que más te convengan. Las reservas se gestionan desde la plataforma." },
                            { q: "¿Cómo funciona el soporte de monitores?", a: "Nuestros monitores están disponibles durante las clases para ayudarte con la técnica y recomendaciones personalizadas." }
                        ].map((item, idx) => (
                            <button 
                                key={idx}
                                onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
                                className={`w-full p-6 rounded-xl bg-neutral-900/50 border border-neutral-700 hover:border-neutral-600 transition-all text-left faq-item-active animate-fade-in-up ${expandedFAQ === idx ? 'faq-item-active' : ''}`}
                                style={{animationDelay: `${idx * 60}ms`}}
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <p className="font-black text-white uppercase">{item.q}</p>
                                    <div className="faq-icon-rotate">
                                        {expandedFAQ === idx ? <ChevronUp className="text-fitbox-red shrink-0 size-5" /> : <ChevronDown className="text-gray-500 shrink-0 size-5" />}
                                    </div>
                                </div>
                                {expandedFAQ === idx && (
                                    <p className="text-gray-300 mt-4 text-sm leading-relaxed faq-expand">{item.a}</p>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* SECCIÓN: CTA FINAL */}
                <div className="mt-40 mb-20 w-full max-w-4xl text-center animate-fade-in-up">
                    <div className="p-12 rounded-3xl bg-neutral-900/60 border border-neutral-700 backdrop-blur-sm hover-lift hover:border-neutral-600 transition-all">
                        <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-4 italic">
                            ¿Listo para <span className="text-fitbox-red">entrenar</span>?
                        </h3>
                        <p className="text-gray-300 mb-8 text-lg">Comienza hoy tu suscripción a FITBOX. Sin compromisos, fácil acceso, y con el mejor equipo.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button onClick={() => setShowRegisterModal(true)} className="bg-fitbox-red hover:bg-red-700 text-white font-black px-10 py-6 text-lg btn-glow">
                                INICIAR AHORA
                            </Button>
                            <Button variant="outline" onClick={() => setShowLoginModal(true)} className="border-fitbox-red text-fitbox-red hover:bg-red-950/20 px-10 py-6 text-lg font-bold hover-glow">
                                YA SOY MIEMBRO
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {showLoginModal && (
                <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-md relative">
                        <Card className="p-8 shadow-2xl bg-neutral-950/90 border-neutral-800 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-fitbox-red via-red-600 to-red-900"></div>

                            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                                <X className="size-6" />
                            </button>

                            <div className="mb-8 text-center">
                                <h1 className="text-4xl font-extrabold text-white tracking-tight italic uppercase">
                                    FIT<span className="text-fitbox-red">BOX</span>
                                </h1>
                                <p className="text-fitbox-text-muted mt-2">Acceso área privada</p>
                            </div>

                            {authError && <Alert type="error" message={authError} />}

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="login-email" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email Corporativo</label>
                                    <Input
                                        id="login-email"
                                        type="email"
                                        placeholder="socio@fitbox.com"
                                        className="bg-neutral-900 border-neutral-800 text-white h-12 focus:border-fitbox-red transition-all"
                                        {...register("email", { required: true, pattern: REGEX.EMAIL_GENERAL })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="login-password" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Contraseña</label>
                                    <Input
                                        id="login-password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="bg-neutral-900 border-neutral-800 text-white h-12 focus:border-fitbox-red transition-all"
                                        {...register("password", { required: true })}
                                    />
                                </div>

                                <div className="text-right">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowLoginModal(false);
                                            setShowResetModal(true);
                                        }}
                                        className="text-[10px] text-gray-500 hover:text-fitbox-red transition-colors font-bold uppercase tracking-widest"
                                    >
                                        ¿Has olvidado tu contraseña?
                                    </button>
                                </div>

                                <div className="pt-2">
                                    <Button type="submit" className="w-full bg-fitbox-red hover:bg-red-700 text-white font-bold py-6 text-lg shadow-lg" disabled={isPendingLogin}>
                                        {isPendingLogin ? 'Comprobando credenciales…' : 'Acceder'}
                                    </Button>
                                </div>
                            </form>

                            <div className="mt-6 text-center text-sm text-fitbox-text-muted">
                                ¿No tienes cuenta?{' '}
                                <button
                                    onClick={() => {
                                        setShowLoginModal(false);
                                        setShowRegisterModal(true);
                                    }}
                                    className="text-fitbox-red font-semibold hover:text-white transition-colors"
                                >
                                    Crea una ahora
                                </button>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {showResetModal && (
                <div className="fixed inset-0 z-110 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                    <Card className="w-full max-w-md p-8 bg-neutral-950/90 border-neutral-800 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-fitbox-red"></div>
                        <button onClick={() => { setShowResetModal(false); setResetSuccess(false); }} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                            <X className="size-6" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="size-16 bg-red-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-900/50">
                                <Mail className="text-fitbox-red size-8" />
                            </div>
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Recuperar <span className="text-fitbox-red">Acceso</span></h2>
                        </div>

                        {resetSuccess ? (
                            <div className="text-center py-4 space-y-6 animate-in zoom-in">
                                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                                    <CheckCircle className="size-12 text-green-500 mx-auto mb-2" />
                                    <p className="text-sm text-gray-300 font-medium">Revisa tu bandeja de entrada. Te hemos enviado un enlace seguro para cambiar tu contraseña.</p>
                                </div>
                                <Button onClick={() => setShowResetModal(false)} className="w-full bg-neutral-800 font-bold">Cerrar ventana</Button>
                            </div>
                        ) : (
                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <p className="text-sm text-gray-400 text-center">Introduce el email de tu cuenta y te enviaremos las instrucciones de restablecimiento.</p>
                                <div className="space-y-2">
                                    <label htmlFor="reset-email" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email de Registro</label>
                                    <Input
                                        id="reset-email"
                                        type="email"
                                        placeholder="tu@email.com"
                                        required
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        className="bg-neutral-900 border-neutral-800 h-12 text-white"
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-fitbox-red py-6 font-bold shadow-lg" disabled={isPendingReset}>
                                    {isPendingReset ? 'Enviando…' : 'Enviar enlace de recuperación'}
                                </Button>
                            </form>
                        )}
                    </Card>
                </div>
            )}

            {showRegisterModal && (
                <RegisterPage
                    onClose={() => setShowRegisterModal(false)}
                    onShowLogin={() => {
                        setShowRegisterModal(false);
                        setShowLoginModal(true);
                    }}
                />
            )}
        </div>
    );
};