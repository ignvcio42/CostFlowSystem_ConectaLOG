import { useState } from "react";
import Joyride from "react-joyride";

export default function TutorialGlosario() {
  const [run, setRun] = useState(false);
  const [tourKey, setTourKey] = useState(0);

  const steps = [
    {
      target: "#glosario-header",
      content: "Este es el título del glosario.",
      placement: "bottom", // ⬅️ controla dónde aparece
      disableScrolling: true,
    },
    {
      target: "#glosario-selector",
      content: "Aquí puedes elegir el tipo de dato que quieres consultar.",
      placement: "bottom",
      disableScrolling: true,
    },
    {
      target: "#buscador-glosario",
      content: "Aquí puedes buscar un dato en particular.",
      placement: "bottom",
      disableScrolling: true,
    },
    {
      target: "#glosario-resultados",
      content: "Aquí aparecerán los resultados filtrados.",
      placement: "top",
      disableScrolling: true,
    },
    {
      target: "#contenedor-ver-mas",
      content: "Aquí puedes ver el detalle de un dato.",
      placement: "left",
      disableScrolling: true,
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
        disableOverlay={false}
        scrollToSteps={false}
        disableScrolling={true} // ✅ desactiva internamente el scroll
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
