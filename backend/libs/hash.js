import crypto from 'crypto';

export function generarHashConsulta(consulta) {
    const str = JSON.stringify(consulta);
    return crypto.createHash('sha256').update(str).digest('hex');
}
