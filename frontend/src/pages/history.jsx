import React, { useEffect, useState } from "react";
import api from "../libs/api_calls";
import useStore from "@/store";

const History = () => {
  const [historial, setHistorial] = useState([]);
  const [error, setError] = useState("");
  
    const { user } = useStore((state) => state);

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const response = await api.get("/consultas-historicas/historial");
        setHistorial(response.data);
      } catch (err) {
        console.error(err);
        setError("No se pudo obtener el historial.");
      }
    };

    fetchHistorial();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 border rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Historial de Consultas</h2>
      {error && <p className="text-red-600">{error}</p>}
      {historial.length === 0 ? (
        <p>No hay consultas registradas aún.</p>
      ) : (
        <ul className="space-y-4">
          {historial.map((consulta, index) => (
            <li key={consulta.id} className="p-4 bg-gray-100 rounded">
              <p className="text-sm text-gray-600">
                <strong>Consulta #{index + 1}</strong> - {new Date(consulta.fecha_consulta).toLocaleString()}
              </p>
              <pre className="text-xs mt-2 bg-white p-2 rounded overflow-x-auto">
                {JSON.stringify(consulta.respuesta_json, null, 2)}
              </pre>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default History;
