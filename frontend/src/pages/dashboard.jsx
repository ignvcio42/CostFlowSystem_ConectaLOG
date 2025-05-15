import React, { useState } from "react";
import api from "../libs/api_calls";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { useOpciones } from "../hooks/useOpciones";

const emptyQuery = {
  producto: "",
  carga: 0, // Cambiado a número
  modo: "",
  toneladas: 0.0, // Cambiado a número
  importacion: 0, // Cambiado a número
  comuna: 0, // Cambiado a número
  puerto: 0, // Cambiado a número
  puerto_ext: 0, // Cambiado a número
  pais: 0, // Cambiado a número
  cargapeligrosa: 0, // Cambiado a número
};

const fieldLabels = {
  producto: "Producto",
  carga: "Tipo de Carga",
  modo: "Modo de Transporte",
  toneladas: "Toneladas",
  importacion: "Tipo de operación",
  comuna: "Comuna",
  puerto: "Puerto",
  puerto_ext: "Puerto Exterior",
  pais: "País",
  cargapeligrosa: "Carga Peligrosa",
};

const Dashboard = () => {
  const [queries, setQueries] = useState([structuredClone(emptyQuery)]);
  const [resultados, setResultados] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError("");
    setResultados([]);

    try {
      const responses = await Promise.all(
        queries.map((q) => api.post("/consultas-historicas/consultar", q))
      );
      setResultados(responses.map((r) => r.data));
      navigate("/history");
    } catch (err) {
      console.error(err);
      setError("Error en alguna de las consultas.");
      //recargar la página
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 border rounded-lg shadow-md ">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">
        Múltiples Consultas
      </h2>

      <form onSubmit={handleSubmit}>
        {queries.map((query, index) => (
          <div
            key={index}
            className="mb-6 border p-4 rounded bg-gray-50 relative"
          >
            <h3 className="font-semibold mb-2">Consulta #{index + 1}</h3>
            <span className="text-yellow-600 text-sm ">
              Confirmar cada selección, por favor.
            </span>
            <button
              type="button"
              onClick={() => removeQuery(index)}
              className="absolute top-2 right-2 text-red-500"
              disabled={queries.length === 1}
            >
              ✖
            </button>

            {Object.entries(query).map(([key, val]) => (
              <div key={key} className="mb-2">
                <label className="block text-sm font-medium capitalize mb-1">
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
                      newQueries[index][key] = selected.value;
                      setQueries(newQueries);
                    }}
                    isClearable
                    placeholder="Selecciona una opción..."
                    className="text-sm"
                  />
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
                    className="w-full border px-3 py-1 rounded text-sm"
                    required
                    step={key === "toneladas" ? "0.01" : "1"} // Esto permite 2 decimales
                  />
                )}
              </div>
            ))}
          </div>
        ))}

        <div className="flex gap-4 mb-4">
          <button
            type="button"
            onClick={addQuery}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            + Agregar Consulta
          </button>
          <button
            type="submit"
            disabled={cargando}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {cargando ? "Consultando..." : "Enviar Todo"}
          </button>
          <button
            type="button"
            onClick={() => setQueries([structuredClone(emptyQuery)])}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Limpiar Todo
          </button>
        </div>
      </form>

      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
};

export default Dashboard;
