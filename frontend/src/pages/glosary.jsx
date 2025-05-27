import { useState } from "react";
import GlosarioSection from "@/components/Glosario/GlosarioSection";
import { Button } from "@/components/ui/button";

import comunas from "@/data/comunas_opciones.json";
import carga from "@/data/diccionario_carga.json";
import cargapeligrosa from "@/data/diccionario_cargaspeligrosas.json";
import importaciones from "@/data/diccionario_importaciones.json";
import modos from "@/data/diccionario_modos.json";
import paises from "@/data/paises_opciones.json";
import puertos from "@/data/puertos_opciones.json";
import puertosext from "@/data/puertosext_opciones.json";
import capitulos from "@/data/productos/capitulo.json";
import glosas from "@/data/productos/glosa_producto.json";
import partidas from "@/data/productos/partida.json";
import subpartidas from "@/data/productos/subpartida.json";
import TutorialGlosario from "@/components/tutoriales/TutorialGlosario";

const secciones = [
  { key: "capitulos", label: "Capítulos", data: capitulos },
  { key: "partidas", label: "Partidas", data: partidas },
  { key: "subpartidas", label: "Subpartidas", data: subpartidas },
  { key: "glosas", label: "Glosas", data: glosas },
  { key: "comunas", label: "Comunas", data: comunas },
  { key: "carga", label: "Carga", data: carga },
  { key: "cargapeligrosa", label: "Cargas Peligrosas", data: cargapeligrosa },
  { key: "importaciones", label: "Importaciones", data: importaciones },
  { key: "modos", label: "Modos de Transporte", data: modos },
  { key: "paises", label: "Países", data: paises },
  { key: "puertos", label: "Puertos Nacionales", data: puertos },
  { key: "puertosext", label: "Puertos Extranjeros", data: puertosext },
];

export default function GlosarioPage() {
  const [selected, setSelected] = useState("comunas");

  const current = secciones.find((s) => s.key === selected);

  return (
    <div className="relative min-h-screen p-4 ">
      <div id="glosario-header" className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold dark:text-white transition-all duration-300">
          Glosario
        </h1>
        <TutorialGlosario />
      </div>

      <div id="glosario-selector" className="flex flex-wrap gap-2 mb-4">
        {secciones.map((s) => (
          <Button
            key={s.key}
            variant={s.key === selected ? "default" : "secondary"}
            onClick={() => setSelected(s.key)}
            className="hover:bg-gray-200 dark:text-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600 rounded transition-all duration-300 hover:shadow-md hover:scale-105"
          >
            {s.label}
          </Button>
        ))}
      </div>

      <div id="glosario-resultados">
        {current && (
          <GlosarioSection title={current.label} items={current.data} />
        )}
      </div>
    </div>
  );
}
