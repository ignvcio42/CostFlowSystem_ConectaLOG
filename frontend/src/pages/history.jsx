import React, { useEffect, useState } from "react";
import api from "../libs/api_calls";
import useStore from "@/store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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

  const renderConsulta = (consulta, index) => {
    const nacional = consulta.respuesta_json?.Nacional;
    const internacional = consulta.respuesta_json?.Internacional;
    return (
      <Card
      key={consulta.id}
      className="dark:bg-muted bg-white p-4 rounded-xl shadow transition-all duration-300"
      >
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2 dark:text-white dark:bg-muted transition-all duration-300">
        <strong>Consulta #{index + 1}</strong> -{" "}
        {new Date(consulta.fecha_consulta).toLocaleString()}
        </p>

        {nacional && (
        <div className="mb-3">
          <h3 className="text-lg font-semibold mb-1 dark:text-white">🏙️ Nacional</h3>
          <p className="dark:text-white"> 
          <strong>Origen:</strong> {nacional["origen local"]}
          </p>
          <p className="dark:text-white">
          <strong>Destino:</strong> {nacional["destino local"]}
          </p>
          <p className="dark:text-white">
          <strong>Producto:</strong> {nacional.producto?.Partida}
          </p>
          <p className="dark:text-white">
          <strong>Capítulo:</strong> {nacional.producto?.Capitulo}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 dark:text-white">
          <Badge variant="outline">
            Peajes: $
            {Number(
            nacional["Costos ($USD)"]["Costo Peajes local($USD/tkm)"] ??
              0
            ).toFixed(2)}
          </Badge>
          <Badge variant="outline">
            Utilidad: $
            {Number(
            nacional["Costos ($USD)"]["Utilidad empresa local($USD)"] ??
              0
            ).toFixed(2)}
          </Badge>
          <Badge variant="outline">
            Costo Total: $
            {Number(
            nacional["Costos ($USD)"][
              "Costo Total local Camión($USD/tkm)"
            ] ?? 0
            ).toFixed(2)}
          </Badge>
          </div>
        </div>
        )}

        {internacional && (
        <div>
          <h3 className="text-lg font-semibold mb-1 dark:text-white">🌐 Internacional</h3>
          <p className="dark:text-white">
          <strong>Sector Productivo:</strong>{" "}
          {internacional["Sector Productivo"]}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 dark:text-white">
          <Badge variant="outline">
            Flete: $
            {Number(internacional["Costo Flete ($USD/ton)"] ?? 0).toFixed(
            2
            )}
          </Badge>
          <Badge variant="outline">
            Seguro: $
            {Number(
            internacional["Costo Seguro ($USD/ton)"] ?? 0
            ).toFixed(2)}
          </Badge>
          <Badge variant="outline">
            Documental: $
            {Number(
            internacional["Costo Documental ($USD/ton)"] ?? 0
            ).toFixed(2)}
          </Badge>
          </div>
          {internacional.Warning && (
          <p className="text-xs text-muted-foreground mt-2 dark:text-white">
            ⚠️ {internacional.Warning}
          </p>
          )}
        </div>
        )}
      </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h2 className="text-3xl font-bold mb-6 text-center dark:text-white">
        Historial de Consultas
      </h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {historial.length === 0 ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 ">
          {historial.map((consulta, index) => renderConsulta(consulta, index))}
        </div>
      )}
    </div>
  );
};

export default History;
