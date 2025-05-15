import comunas from "../data/comunas_opciones.json";
import paises from "../data/paises_opciones.json";
import puertos from "../data/puertos_opciones.json";
import puertosext from "../data/puertosext_opciones.json";

export const useOpciones = () => {
  return {
    comunas,
    paises,
    puertos,
    puertosext,
    modos: [
      { value: "Ferrocarril", label: "Ferrocarril" },
      { value: "Camión", label: "Camión" },
    ],
    cargas: [
      { value: 1, label: "Granel líquido" },
      { value: 2, label: "Carga General" },
      { value: 3, label: "Granel Solido" },
      { value: 4, label: "Carga Container Dry" },
    ],
    cargaspeligrosas: [
      { value: 0, label: "No" },
      { value: 1, label: "Si" },
    ],
    importaciones: [
      { value: 0, label: "Exportacion" },
      { value: 1, label: "Importacion" },
    ],
  };
};
