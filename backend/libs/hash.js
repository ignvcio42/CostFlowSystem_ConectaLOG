import crypto from 'crypto';

export function generarHashConsulta(consulta) {
  const ordered = {};
  Object.keys(consulta)
    .sort()
    .forEach((key) => {
      let val = consulta[key];

      // Normaliza undefined y null
      if (val === undefined || val === null || val === "") {
        val = null;
      }

      // Convierte strings numéricos a número
      if (typeof val === "string" && !isNaN(val.trim())) {
        val = Number(val.trim());
      }

      // Convierte booleanos tipo checkbox (0, 1)
      if (val === "true") val = true;
      if (val === "false") val = false;

      ordered[key] = val;
    });

  const str = JSON.stringify(ordered);
  return crypto.createHash("sha256").update(str).digest("hex");
}
