import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";

export default function NotFound() {
  const navigate = useNavigate();
  const [moving, setMoving] = useState(false);
  const truckRef = useRef();

  // Al terminar la animación, navega al home
  const handleAnimationEnd = () => {
    navigate("/");
  };

  const handleStart = () => {
    if (!moving) setMoving(true);
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-slate-800 via-slate-700 to-blue-900 relative overflow-hidden">
      {/* Fondo desenfocado (opcional) */}
      <img
        src="/img/logistica-scaled.jpeg"
        alt="404"
        className="absolute inset-0 w-full h-full object-cover blur-sm opacity-30 z-0 pointer-events-none select-none"
        draggable={false}
      />
      {/* Card */}
      <div className="relative z-10 max-w-lg mx-auto rounded-3xl shadow-xl bg-white/80 dark:bg-slate-900/80 border border-white/20 backdrop-blur-lg px-10 py-12 flex flex-col items-center">
        <div className="text-6xl font-black text-blue-600 drop-shadow-lg mb-2 select-none">
          404
        </div>
        <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white text-center">
          ¡Ups! Página no encontrada
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 text-center">
          Parece que te perdiste en el camino... ¡Súbete al camión para volver!
        </p>

        {/* Carretera y camión */}
        <div className="relative w-full h-40 sm:h-44 md:h-52 mb-6 select-none overflow-x-hidden">
          <div className="absolute bottom-4 left-0 right-0 h-8 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500 rounded-full blur-[1.5px]" />
          <img
            ref={truckRef}
            src="/img/5403380.png"
            alt="Bus"
            className={`absolute left-0 bottom-8 w-32 sm:w-40 transition-transform duration-[2.2s] ease-in-out
      ${moving ? "translate-x-[150%] sm:translate-x-[150%]" : ""}
    `}
            style={{
              transitionProperty: "transform",
            }}
            onTransitionEnd={handleAnimationEnd}
            draggable={false}
          />
        </div>

        {/* Botón */}
        <button
          onClick={handleStart}
          disabled={moving}
          className={`px-6 py-3 mt-4 rounded-2xl font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xl transition-all duration-300 flex items-center gap-2 text-lg ${
            moving ? "opacity-60 pointer-events-none" : ""
          }`}
        >
          {moving ? "En camino..." : "Llévame al inicio"}
        </button>
      </div>
    </div>
  );
}
