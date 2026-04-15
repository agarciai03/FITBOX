export const REGEX = {
    // Solo correos terminados exactamente en @gmail.com
    EMAIL_GMAIL: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,

    // Correo general corporativo
    EMAIL_GENERAL: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,

    // Nombres y Apellidos (Solo letras y espacios, mínimo 2)
    TEXTO_PURO: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/,

    // DNI español: exactamente 8 números seguidos de 1 letra
    DNI: /^\d{8}[a-zA-Z]$/,

    // NIE español: Letra X, Y o Z, 7 números y 1 letra
    NIE: /^[XYZxyz]\d{7}[a-zA-Z]$/,

    // Teléfono de España: Exactamente 9 dígitos
    TELEFONO: /^[0-9]{9}$/,

    // Código Postal de España
    CODIGO_POSTAL: /^(0[1-9]|[1-4]\d|5[0-2])\d{3}$/,

    // Contraseña
    PASSWORD: /^.{6,}$/
};

// Función para AUTO-GENERAR la letra del DNI
export const calcularLetraDNI = (numeros: string): string => {
    if (!/^\d{8}$/.test(numeros)) return '';
    const validLetters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    return validLetters.charAt(parseInt(numeros, 10) % 23);
};

// Función matemática para validar un DNI completo
export const isValidDNI = (dni: string): boolean => {
    if (!REGEX.DNI.test(dni)) return false;

    const validLetters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const numbers = parseInt(dni.slice(0, 8), 10);
    const letter = dni.slice(8).toUpperCase();

    const correctLetter = validLetters.charAt(numbers % 23);
    return letter === correctLetter;
};