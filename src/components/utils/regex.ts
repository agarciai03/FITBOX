export const REGEX = {
    // Solo correos terminados exactamente en @gmail.com (como pediste)
    EMAIL_GMAIL: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,

    // DNI español: exactamente 8 números seguidos de 1 letra (mayúscula o minúscula)
    DNI: /^\d{8}[a-zA-Z]$/,

    // Teléfono de España: 9 dígitos exactos (y que empiece por 6, 7, 8 o 9)
    TELEFONO: /^[6-9]\d{8}$/,

    // Código Postal de España: 5 dígitos, donde los dos primeros van del 01 al 52
    CODIGO_POSTAL: /^(0[1-9]|[1-4]\d|5[0-2])\d{3}$/,

    // Contraseña: Mínimo 6 caracteres (cualquier tipo de carácter)
    PASSWORD: /^.{6,}$/
};

// El regex del DNI solo comprueba el formato (8 números + 1 letra).
// Esta función matemática comprueba que la letra coincida realmente con los números según la ley española.
export const isValidDNI = (dni: string): boolean => {
    if (!REGEX.DNI.test(dni)) return false;
    
    const validLetters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const numbers = parseInt(dni.slice(0, 8), 10);
    const letter = dni.slice(8).toUpperCase();
    
    const correctLetter = validLetters.charAt(numbers % 23);
    return letter === correctLetter;
};