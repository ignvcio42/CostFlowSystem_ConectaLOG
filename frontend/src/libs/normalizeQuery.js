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

      // Campos que DEBEN ser strings (como en el formulario original)
      const stringFields = [
        "producto",
        "comuna",
        "puerto",
        "puerto_ext",
        "pais",
      ];

      if (stringFields.includes(key)) {
        val = String(val).trim(); // Forzar a string
      }
      // Otros campos numéricos (toneladas, carga, etc.)
      else if (typeof val === "string" && !isNaN(val.trim())) {
        val = Number(val.trim());
      }

      // Manejo de booleanos/numéricos especiales
      if (val === "true") val = true;
      if (val === "false") val = false;
      if (key === "importacion" || key === "cargapeligrosa") {
        val = Number(val); // Asegurar 0 o 1 como número
      }

      normalized[key] = val;
    });

  return normalized;
};