import { Link } from "react-router-dom";
import { FaTruckPlane } from "react-icons/fa6";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-violet-700 dark:bg-red-500 rounded-xl p-3">
              <FaTruckPlane className="text-white text-2xl" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">CostFlow System</h3>
              <p className="text-sm">© {year} Fundación Conecta Logística. Todos los derechos reservados.</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center md:justify-end gap-4 md:gap-8">
            <Link to="/" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Inicio</Link>
            <Link to="/history" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Historial</Link>
            <Link to="/settings" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Configuracion</Link>
            <Link to="/glosary" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Glosario</Link>
            {/* <a href="mailto:soporte@conectalogistica.cl" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Contacto</a> */}
          </div>
        </div>

        <div className="mt-6 border-t border-gray-200 dark:border-slate-700 pt-4 text-center text-xs">
          Desarrollado por <span className="font-semibold">Conecta Logistica</span>
        </div>
      </div>
    </footer>
  );
}
