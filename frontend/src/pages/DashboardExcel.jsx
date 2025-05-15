import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../libs/api_calls";
import useStore from "@/store";
import { normalizeQuery } from "@/libs/normalizeQuery";

const DashboardExcel = () => {
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const { user } = useStore((state) => state);
  const [errores, setErrores] = useState([]);

  const downloadTemplate = () => {
    const headers = [
      "producto",
      "carga",
      "modo", // Ingresar 'Camion' o 'Ferrocarril' (sin tilde)
      "toneladas",
      "importacion", // 1 para sí, 0 para no
      "comuna", // código comuna
      "puerto", // código puerto
      "puerto_ext", // código puerto exterior
      "pais", // código país
      "cargapeligrosa", // 1 o 0
    ];

    const exampleRow = ["38221900", 2, "camion", 1, 0, 7401, 992, 0, 563, 0];

    const worksheet = XLSX.utils.aoa_to_sheet([headers, exampleRow]);

    // Agregar comentario al encabezado
    worksheet["C1"].c = [
      {
        t: "Ingresar 'Camion' o 'Ferrocarril' (sin tilde). Se normaliza automáticamente.",
        a: "Sistema",
      },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Plantilla");

    XLSX.writeFile(workbook, "template_consulta.xlsx");

    toast.warning("Recuerde NO usar tildes. Ej: 'Camion', no 'Camión'.");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const errores = [];
      const queries = [];

      rows.forEach((row, index) => {
        const fila = index + 2; // +2 porque el encabezado está en la fila 1

        // Validaciones básicas
        const camposObligatorios = [
          "producto",
          "carga",
          "modo",
          "toneladas",
          "importacion",
          "comuna",
          "puerto",
          "puerto_ext",
          "pais",
          "cargapeligrosa",
        ];

        camposObligatorios.forEach((campo) => {
          if (
            row[campo] === "" ||
            row[campo] === null ||
            row[campo] === undefined
          ) {
            errores.push(
              `Fila ${fila}: Falta el campo obligatorio '${campo}'.`
            );
          }
        });

        // Validación del campo "modo"
        if (row.modo === "Camion" || row.modo === "camion") {
          row.modo = "Camión";
        } else if (row.modo === "Ferrocarril" || row.modo === "ferrocarril") {
          row.modo = "Ferrocarril";
        } else {
          errores.push(
            `Fila ${fila}: Modo inválido '${row.modo}'. Use 'Camion' o 'Ferrocarril'.`
          );
        }

        // Validación de toneladas
        if (isNaN(Number(row.toneladas)) || Number(row.toneladas) <= 0) {
          errores.push(
            `Fila ${fila}: 'toneladas' debe ser un número mayor que 0.`
          );
        }

        // Validación de importacion y cargapeligrosa
        ["importacion", "cargapeligrosa"].forEach((campo) => {
          const val = Number(row[campo]);
          if (val !== 0 && val !== 1) {
            errores.push(`Fila ${fila}: '${campo}' debe ser 0 o 1.`);
          }
        });

        // Validar códigos numéricos
        ["producto", "comuna", "puerto", "puerto_ext", "pais"].forEach(
          (campo) => {
            if (isNaN(Number(row[campo]))) {
              errores.push(`Fila ${fila}: '${campo}' debe ser numérico.`);
            }
          }
        );

        // Si no hay errores para esta fila, normalizar y guardar
        if (!errores.some((e) => e.includes(`Fila ${fila}:`))) {
          queries.push(normalizeQuery(row));
        }
      });

      if (errores.length > 0) {
        setErrores(errores); // Muestra card con errores
        return;
      }

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
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 p-6 border rounded-xl shadow-lg bg-white dark:bg-muted dark:text-white transition-all duration-300">
      <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
        Consulta por Archivo Excel
      </h2>

      <div className="flex flex-col gap-4">
        <button
          onClick={downloadTemplate}
          className="px-4 py-2 bg-yellow-300 text-yellow-900 rounded-lg hover:bg-yellow-400 transition-colors"
        >
          Descargar Plantilla Excel
        </button>

        <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-center">
          Subir Archivo Excel
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {cargando && <p className="text-blue-600">Procesando archivo...</p>}
      </div>
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="font-bold mb-2">Instrucciones:</h3>
        <ol className="list-decimal pl-5 space-y-2 text-sm">
          <li>Descargue la plantilla haciendo clic en el botón superior</li>
          <li>
            Complete los datos en la segunda fila (la primera fila contiene los
            encabezados)
          </li>
          <li>Guarde el archivo en formato Excel (.xlsx)</li>
          <li>Suba el archivo usando el botón "Subir Archivo Excel"</li>
          <li>
            Los valores deben escribirse sin tildes (ej: "camion" en lugar de
            "camión")
          </li>
          <li>
            Para valores numéricos, use solo números (ej: 1, 2, 3.5, 20.15)
          </li>
        </ol>
      </div>

      <ToastContainer position="bottom-right" autoClose={3000} />

      {errores.length > 0 && (
        <div className="mt-6 p-4 rounded-xl shadow-lg border border-red-400 bg-red-50 dark:bg-red-900 dark:border-red-700">
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-200 mb-2">
            Se encontraron errores en el archivo:
          </h3>
          <ul className="list-disc list-inside text-sm text-red-800 dark:text-red-100 max-h-48 overflow-y-auto">
            {errores.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Archivo Corregido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardExcel;
