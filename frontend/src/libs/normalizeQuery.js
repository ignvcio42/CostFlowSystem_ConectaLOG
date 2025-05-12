export const normalizeQuery = (query) => {
  const normalized = {};
  Object.keys(query)
    .sort()
    .forEach((key) => {
      let val = query[key];

      // Normaliza undefined, null, y ""
      if (val === undefined || val === null || val === "") {
        val = null;
      }

      // Convierte strings numéricos a número
      if (typeof val === "string" && !isNaN(val.trim())) {
        val = Number(val.trim());
      }

      // Convierte "true"/"false" a booleanos reales
      if (val === "true") val = true;
      if (val === "false") val = false;

      normalized[key] = val;
    });

  return normalized;
};
