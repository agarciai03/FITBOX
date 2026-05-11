// USUARIOS Y ROLES
export interface Usuario {
    id_usuario: string;
    nombre: string;
    apellidos: string;
    email: string;
    id_rol: number;
    telefono: string;
    avatar_url?: string;
    roles?: { nombre_rol: string };
    xp?: number;
    nivel?: number;
}

export interface UserProfile {
    apellidos: string;
    dni: string;
    sexo: string;
    telefono: string;
    pais: string;
    provincia: string;
    codigo_postal: string;
    localidad: string;
    id_usuario: string;
    nombre: string;
    email: string;
    id_rol: number;
    avatar_url?: string;
    roles?: {
        nombre_rol: string;
    };
    estado_pago?: string;
}

export interface RegisterData {
    nombre: string;
    apellidos: string;
    email: string;
    password?: string;
    dni: string;
    telefono: string;
    sexo: string;
    fecha_nacimiento: string;
    pais: string;
    codigo_postal: string;
    localidad: string;
    provincia: string;
    id_rol?: number;
    avatar_url?: string | null;
    id_disciplina?: string | null;
}


// CLASES Y RESERVAS
export interface Disciplina {
    id_disciplina: string;
    nombre: string;
    aforo_maximo?: number;
}

export interface Rutina {
    id_rutina: string;
    id_disciplina: string;
    dia_semana: string;
    titulo: string;
    descripcion: string;
}

export interface Clase {
    total_reservas?: number;
    id_clase: string;
    id_disciplina: string;
    id_monitor: string | null;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    aforo_maximo: number;
    disciplinas?: { nombre: string };
    usuarios?: { nombre: string; apellidos: string };
    reservas?: Reserva[];
}

export interface Reserva {
    id: string;
    id_clase: string;
    id_socio: string;
    fecha_reserva: string;
    estado: string;
    clases?: Clase;
    asistencia?: boolean | null;
    usuarios?: {
        nombre: string;
        apellidos: string;
        email?: string;
    };
}

// MAQUINARIA E INVENTARIO
export type EstadoMaquina = 'Correcto' | 'Defectuoso' | 'Correcto pero con observaciones';

export interface Maquina {
    id_maquina: string;
    nombre: string;
    estado: EstadoMaquina;
    fecha_averia: string | null;
    observaciones: string | null;
    id_monitor_reporte: string | null;
    fecha_registro: string;
    descripcion?: string | null;
    tutorial_url?: string | null;
    id_disciplina?: string | null;
    disciplinas?: { nombre: string };
}

// PAGOS Y FACTURACIÓN
export interface Pago {
    id_pago: number;
    id_usuario: string;
    importe: number;
    concepto: string;
    fecha_pago: string;
    metodo_pago?: string;
    estado_pago?: string;
    usuarios?: {
        nombre: string;
        apellidos: string;
    };
}