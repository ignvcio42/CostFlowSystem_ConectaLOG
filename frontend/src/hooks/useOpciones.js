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
  };
};
