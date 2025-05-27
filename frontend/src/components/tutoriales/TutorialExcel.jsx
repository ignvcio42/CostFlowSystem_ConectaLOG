import { useState } from "react";
import Joyride from "react-joyride";

export default function TutorialExcel() {
  const [run, setRun] = useState(false);
  const [tourKey, setTourKey] = useState(0);

  const steps = [
  {
    target: "#formulario-header",
    content: "Aquí puedes realizar múltiples consultas logísticas mediante Excel.",
  },
    {
        target: "#descarga-plantilla",
        content: "Descarga la plantilla de Excel para cargar tus consultas.",
    },
    {
        target: "#carga-excel",
        content: "Carga tus consultas en la plantilla de Excel.",
    },
    {
        target: "#instrucciones",
        content: "Sigue las instrucciones para completar el formulario.",
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
