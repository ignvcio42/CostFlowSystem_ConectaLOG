import React, { useState } from "react";
import api from "../libs/api_calls";

const emptyQuery = {
  producto: "",
  carga: 2,
  modo: "Ferrocarril",
  toneladas: 1,
  importacion: 0,
  comuna: "",
  puerto: "",
  puerto_ext: "",
  pais: "",
  cargapeligrosa: 0,
};

const Dashboard = () => {
  const [queries, setQueries] = useState([structuredClone(emptyQuery)]);
  const [resultados, setResultados] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleChange = (index, e) => {
    const { name, value, type } = e.target;
    const newQueries = [...queries];
    newQueries[index][name] = type === "number" ? parseInt(value) || "" : value;
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
    } catch (err) {
      console.error(err);
      setError("Error en alguna de las consultas.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 border rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Múltiples Consultas</h2>

      <form onSubmit={handleSubmit}>
        {queries.map((query, index) => (
          <div key={index} className="mb-6 border p-4 rounded bg-gray-50 relative">
            <h3 className="font-semibold mb-2">Consulta #{index + 1}</h3>
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
                <label className="block text-sm font-medium">{key}</label>
                <input
                  name={key}
                  type={typeof val === "number" ? "number" : "text"}
                  value={val}
                  onChange={(e) => handleChange(index, e)}
                  className="w-full border px-3 py-1 rounded"
                  required
                />
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

      {resultados.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Resultados:</h3>
          {resultados.map((res, idx) => (
            <div key={idx} className="mb-4 p-3 bg-green-100 rounded">
              <strong>Consulta #{idx + 1}:</strong>
              <pre className="text-sm">{JSON.stringify(res, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
