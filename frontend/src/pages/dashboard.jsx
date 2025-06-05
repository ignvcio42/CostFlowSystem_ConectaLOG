import React, { useState } from "react";
import api from "../libs/api_calls";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { useOpciones } from "../hooks/useOpciones";
import ProductoSelector from "@/components/ProductoSelector";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import PreguntasFrecuentes from "@/components/qa";
import TutorialFormulario from "@/components/tutoriales/TutorialFormulario";

const emptyQuery = {
  producto: "",
  carga: null, // Cambiado a número
  modo: "", // Cambiado a string
  toneladas: 0.0, // Cambiado a número
  importacion: null, // Cambiado a número
  comuna: null, // Cambiado a número
  puerto: null, // Cambiado a número
  puerto_ext: 0, // Cambiado a número
  pais: null, // Cambiado a número
  cargapeligrosa: 0, // Cambiado a número
};

const fieldLabels = {
  producto: "1) Producto",
  carga: "2) Tipo de Carga",
  modo: "3) Modo de Transporte",
  toneladas: "4) Toneladas",
  importacion: "5) Tipo de operación",
  comuna: "6) Comuna",
  puerto: "7) Puerto",
  puerto_ext: "8) Puerto Exterior",
  pais: "9) País",
  cargapeligrosa: "10) Carga Peligrosa",
};

const Dashboard = () => {
  const [resultados, setResultados] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const location = useLocation();
  const queriesFromHistory = location.state?.queries;

  const [queries, setQueries] = useState(
    queriesFromHistory && queriesFromHistory.length > 0
      ? queriesFromHistory
      : [structuredClone(emptyQuery)]
  );
  const opciones = useOpciones();

  const navigate = useNavigate();

  const handleChange = (index, e) => {
    const { name, value, type } = e.target;
    const newQueries = [...queries];

    if (name === "toneladas") {
      // Permitir decimales para toneladas
      newQueries[index][name] = value === "" ? "" : parseFloat(value) || 0;
    } else {
      newQueries[index][name] =
        type === "number" ? parseInt(value) || "" : value;
    }

    setQueries(newQueries);
  };

  const addQuery = () => {
    setQueries([...queries, structuredClone(emptyQuery)]);
  };

  const removeQuery = (index) => {
    if (queries.length === 1) return;
    const newQueries = queries.filter((_, i) => i !== index);
    setQueries(newQueries);
  };

  const submitQueries = async () => {
    setCargando(true);
    setError("");
    setResultados([]);

    try {
      const response = await api.post(
        "/consultas-historicas/consultar",
        queries
      );
      const results = Array.isArray(response.data)
        ? response.data
        : [response.data];

      // Clasifica buenas y malas (usa 'code' para detectar error)
      const good = [];
      const bad = [];
      results.forEach((r, idx) => {
        if (!r.code) {
          good.push({ ...r, idx }); // idx: posición en queries
        } else {
          bad.push({ ...r, idx });
        }
      });

      const anyApiDown = results.some((r) => r.code === "API_DOWN");

      if (anyApiDown) {
        setError(
          "Error: El sistema de consultas está temporalmente fuera de servicio. Intenta más tarde."
        );
        setResultados([]);
        return;
      }

      if (bad.length > 0) {
        let msg = "";
        if (good.length > 0) {
          msg = `⚠️ Algunas consultas fueron exitosas, pero otras tienen errores. Revisa y corrige las consultas con error antes de continuar.`;
        } else {
          msg = `❌ Todas las consultas tienen errores. Corrige para continuar.`;
        }
        setError(msg);
        setResultados(results);

        // Deja solo las consultas malas para que el usuario las corrija
        setQueries(bad.map((badItem) => queries[badItem.idx]));
        return;
      }

      // Si todas son buenas
      setResultados(results);
      toast.success("Consultas realizadas con éxito");
      setTimeout(() => navigate("/history"), 1000);
    } catch (err) {
      setError(
        "No se pudo contactar con el servidor. Intenta de nuevo más tarde."
      );
      setTimeout(() => window.location.reload(), 3000);
    } finally {
      setCargando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Limpia errores previos

    const vaciosPorConsulta = validarQueries(queries);

    // Busca si alguna consulta tiene campos vacíos
    const consultasInvalidas = vaciosPorConsulta
      .map((campos, idx) =>
        campos.length > 0
          ? `Consulta #${idx + 1}: ${campos
              .map((c) => fieldLabels[c] || c)
              .join(", ")}`
          : null
      )
      .filter(Boolean);

    if (consultasInvalidas.length > 0) {
      setError(
        `Faltan valores por responder:\n` + consultasInvalidas.join("\n")
      );
      return;
    }

    setShowConfirmation(true);
  };

  const validarQueries = (queries) => {
    return queries.map((q) => {
      const vacios = [];
      Object.entries(q).forEach(([key, val]) => {
        if (val === "" || val === null || val === undefined) {
          vacios.push(key);
        }
      });
      return vacios;
    });
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md dark:shadow-gray-900/50 transition-colors duration-300">
        <h2
          id="formulario-header"
          className="text-2xl font-bold mb-6 text-gray-800 dark:text-white"
        >
          Múltiples Consultas
        </h2>
        <div className="flex items-center justify-between mb-4">
          <TutorialFormulario />
        </div>

        <form onSubmit={handleSubmit}>
          {queries.map((query, index) => (
            <div
              key={index}
              className="mb-6 border border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-gray-50 dark:bg-black/20 relative transition-colors duration-300"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200">
                  Consulta #{index + 1}
                </h3>
                <button
                  type="button"
                  onClick={() => removeQuery(index)}
                  className={`p-1 rounded-full ${
                    queries.length === 1
                      ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      : "text-red-500 hover:bg-red-50 dark:hover:bg-gray-600"
                  }`}
                  disabled={queries.length === 1}
                  title={
                    queries.length === 1
                      ? "No se puede eliminar la única consulta"
                      : "Eliminar consulta"
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              <p className="text-yellow-600 dark:text-yellow-400 text-sm mb-4 bg-yellow-50 dark:bg-gray-800 px-3 py-1.5 rounded-md inline-block">
                Confirmar cada selección, por favor.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(query).map(([key, val]) => (
                  <div key={key} className="mb-3" id={`campo-${key}`}>
                    <label className="block text-sm font-medium capitalize mb-1 text-gray-700 dark:text-gray-300">
                      {fieldLabels[key] || key}
                    </label>

                    {key === "comuna" ||
                    key === "pais" ||
                    key === "puerto" ||
                    key === "puerto_ext" ||
                    key === "carga" ||
                    key === "cargapeligrosa" ||
                    key === "importacion" ||
                    key === "modo" ? (
                      <Select
                        options={
                          opciones[
                            key === "comuna"
                              ? "comunas"
                              : key === "pais"
                              ? "paises"
                              : key === "puerto"
                              ? "puertos"
                              : key === "puerto_ext"
                              ? "puertosext"
                              : key === "modo"
                              ? "modos"
                              : key === "cargapeligrosa"
                              ? "cargaspeligrosas"
                              : key === "importacion"
                              ? "importaciones"
                              : "cargas"
                          ]
                        }
                        value={opciones[
                          key === "comuna"
                            ? "comunas"
                            : key === "pais"
                            ? "paises"
                            : key === "puerto"
                            ? "puertos"
                            : key === "puerto_ext"
                            ? "puertosext"
                            : key === "modo"
                            ? "modos"
                            : key === "cargapeligrosa"
                            ? "cargaspeligrosas"
                            : key === "importacion"
                            ? "importaciones"
                            : "cargas"
                        ].find((opt) => opt.value == val)}
                        onChange={(selected) => {
                          const newQueries = [...queries];
                          newQueries[index][key] = selected
                            ? selected.value
                            : "";
                          setQueries(newQueries);
                        }}
                        isClearable
                        placeholder="Selecciona una opción..."
                        className="text-sm react-select-container "
                        classNamePrefix="react-select"
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            backgroundColor: "var(--bg-color)",
                            borderColor: state.isFocused
                              ? "var(--focus-border)"
                              : "var(--border-color)",
                            boxShadow: state.isFocused
                              ? "0 0 0 1px var(--focus-shadow)"
                              : "none",
                            "&:hover": {
                              borderColor: "var(--hover-border)",
                            },
                            minHeight: "36px",
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            backgroundColor: state.isSelected
                              ? "var(--selected-bg)"
                              : state.isFocused
                              ? "var(--focused-bg)"
                              : "var(--option-bg)",
                            color: state.isSelected
                              ? "var(--selected-text)"
                              : "var(--option-text)",
                            "&:active": {
                              backgroundColor: "var(--active-bg)",
                            },
                          }),
                          singleValue: (provided) => ({
                            ...provided,
                            color: "var(--text-color)",
                          }),
                          input: (provided) => ({
                            ...provided,
                            color: "var(--text-color)",
                          }),
                          placeholder: (provided) => ({
                            ...provided,
                            color: "var(--placeholder-color)",
                          }),
                        }}
                      />
                    ) : key === "producto" ? (
                      <div id="campo-producto">
                        <ProductoSelector
                          value={val}
                          onChange={(value) => {
                            const newQueries = [...queries];
                            newQueries[index][key] = value;
                            setQueries(newQueries);
                          }}
                        />
                      </div>
                    ) : (
                      <input
                        name={key}
                        type={
                          key === "toneladas"
                            ? "number"
                            : typeof val === "number"
                            ? "number"
                            : "text"
                        }
                        value={val}
                        onChange={(e) => handleChange(index, e)}
                        className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 dark:focus:border-blue-600 transition"
                        required
                        step={key === "toneladas" ? "0.01" : "1"}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div id="botones-formulario" className="flex flex-wrap gap-3 mb-4">
            <button
              type="button"
              onClick={addQuery}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200 flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Agregar Consulta
            </button>
            <button
              type="submit"
              disabled={cargando}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 transition-colors duration-200 flex items-center gap-1"
            >
              {cargando ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Consultando...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Enviar Todo
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setQueries([structuredClone(emptyQuery)])}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200 flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Limpiar Todo
            </button>
          </div>
        </form>

        {resultados.length > 0 && (
          <div className="mt-4">
            {resultados.map((r, idx) =>
              r.code ? (
                <div
                  key={idx}
                  className="p-2 mb-2 bg-red-100 text-red-800 rounded"
                >
                  Consulta #{idx + 1}: <b>Error</b> -{" "}
                  {r.error || "Consulta inválida"}
                </div>
              ) : (
                <div
                  key={idx}
                  className="p-2 mb-2 bg-green-100 text-green-800 rounded"
                >
                  Consulta #{idx + 1}: <b>Exitosa</b>
                </div>
              )
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-300">
            {Array.isArray(error) ? (
              <ul className="space-y-1">
                {error.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            ) : (
              error.split("\n").map((line, i) => <div key={i}>{line}</div>)
            )}
          </div>
        )}

        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-xl max-w-md w-full mx-4">
              <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
                Confirmar envío
              </h3>
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                Estás a punto de enviar {queries.length} consulta(s). ¿Deseas
                continuar?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    setShowConfirmation(false);
                    await submitQueries();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md dark:shadow-gray-900/50 transition-colors duration-300">
        <PreguntasFrecuentes />
      </div>
    </div>
  );
};

export default Dashboard;
