import { useState } from "react";
import Joyride from "react-joyride";

export default function TutorialFormulario() {
  const [run, setRun] = useState(false);
  const [tourKey, setTourKey] = useState(0);

  const steps = [
  {
    target: "#formulario-header",
    content: "Aquí puedes realizar múltiples consultas logísticas.",
  },
  {
    target: "#campo-producto",
    content: "Selecciona el producto por Capítulo, Partida, Subpartida, etc.",
  },
  {
    target: "#campo-carga",
    content: "Selecciona el tipo de carga.",
  },
  {
    target: "#campo-modo",
    content: "Selecciona el modo de transporte.",
  },
  {
    target: "#campo-toneladas",
    content: "Ingresa el número de toneladas.",
  },
  {
    target: "#campo-importacion",
    content: "Elige si es una importación o exportación.",
  },
  {
    target: "#campo-comuna",
    content: "Selecciona la comuna origen o destino.",
  },
  {
    target: "#campo-puerto",
    content: "Selecciona el puerto nacional.",
  },
  {
    target: "#campo-puerto_ext",
    content: "Selecciona el puerto exterior.",
  },
  {
    target: "#campo-pais",
    content: "Selecciona el país.",
  },
  {
    target: "#campo-cargapeligrosa",
    content: "Indica si la carga es peligrosa.",
  },
  {
    target: "#botones-formulario",
    content: "Usa estos botones para agregar, enviar o limpiar tus consultas.",
  },
];


  const iniciarTutorial = () => {
    setTourKey((prev) => prev + 1);
    setRun(true);
  };

  return (
    <>
      <Joyride
        key={tourKey}
        steps={steps}
        run={run}
        continuous
        showProgress
        showSkipButton
        disableBeacon={true}
        scrollToSteps={false}
        disableScrolling={true}
        styles={{
          options: {
            zIndex: 10000,
            primaryColor: "#2563eb",
          },
        }}
        callback={({ status }) => {
          if (["finished", "skipped"].includes(status)) {
            setRun(false);
          }
        }}
      />

      <button
        onClick={iniciarTutorial}
        className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
      >
        Tutorial
      </button>
    </>
  );
}
