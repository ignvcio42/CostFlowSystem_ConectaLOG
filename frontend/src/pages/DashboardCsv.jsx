import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../libs/api_calls";
import useStore from "@/store";
import { normalizeQuery } from "@/libs/normalizeQuery";
import { ToastContainer, toast } from "react-toastify";
import Papa from "papaparse";
import "react-toastify/dist/ReactToastify.css";

const DashboardCsv = () => {
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const { user } = useStore((state) => state);

  const downloadTemplate = () => {
    const csvContent = `producto,carga,modo,toneladas,importacion,comuna,puerto,puerto_ext,pais,cargapeligrosa
38221900,2,camion,1,0,7401,992,0,563,0
`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "template_consulta.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.warning("Recuerde escribir SIN tildes en el archivo CSV. Ej: 'Camion'");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        const queries = result.data.map((row) => {
          // Normalizar valores manuales
          if (row.modo === "Camion" || row.modo === "camion") {
            row.modo = "Camión";
          }

          if (row.modo === "Ferrocarril" || row.modo === "ferrocarril") {
            row.modo = "Ferrocarril";
          }

          // Validación: Error si modo está mal escrito
          if (row.modo !== "Camión" && row.modo !== "Ferrocarril") {
            toast.error(`Error en modo: ${row.modo}. Solo se acepta 'Camion' o 'Ferrocarril' (sin tilde).`);
            setTimeout(() => window.location.reload(), 3000);
            return;
          }

          return normalizeQuery(row);
        });

        // Si hubo error en validación, no continuar
        if (queries.includes(undefined)) return;

        setCargando(true);
        try {
          const responses = await Promise.all(
            queries.map((q) => api.post("/consultas-historicas/consultar", q))
          );
          toast.success("Consultas realizadas con éxito");
          setTimeout(() => navigate("/history"), 1000);
        } catch (err) {
          console.error(err);
          toast.error("Error en la consulta, revise el archivo.");
          setTimeout(() => window.location.reload(), 1000);
        } finally {
          setCargando(false);
        }
      },
      error: (err) => {
        console.error(err);
        toast.error("Error al leer el archivo CSV");
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 p-6 border rounded-xl shadow-lg bg-white dark:bg-muted dark:text-white transition-all duration-300">
      <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
        Consulta por Archivo CSV
      </h2>

      <div className="flex flex-col gap-4">
        <button
          onClick={downloadTemplate}
          className="px-4 py-2 bg-yellow-300 text-yellow-900 rounded-lg hover:bg-yellow-400 transition-colors"
        >
          Descargar Template CSV
        </button>

        <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-center">
          Subir Archivo CSV
          <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
        </label>

        {cargando && <p className="text-blue-600">Procesando archivo...</p>}
      </div>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default DashboardCsv;
