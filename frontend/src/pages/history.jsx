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
            <strong>
              <u>Consulta #{index + 1}</u>
            </strong>{" "}
            - {new Date(consulta.fecha_consulta).toLocaleString()}
          </p>

          {(nacional || internacional) && (
            <div className="mb-3">
              {/* Datos nacionales */}
              {nacional && (
                <>
                  {/* <h3 className="text-lg font-semibold mb-1 dark:text-white">🏙️ Nacional</h3> */}
                  <p className="dark:text-white">
                    <strong>Origen:</strong> {nacional["origen local"]}
                  </p>
                  <p className="dark:text-white">
                    <strong>Destino:</strong> {nacional["destino local"]}
                  </p>
                  <p className="dark:text-white">
                    <strong>Capítulo:</strong> {nacional.producto?.Capitulo}
                  </p>
                  <p className="dark:text-white">
                    <strong>Producto:</strong> {nacional.producto?.Partida}
                  </p>
                  {nacional.producto?.Glosa && (
                    <p className="dark:text-white">
                      <strong>Glosa:</strong> {nacional.producto.Glosa}
                    </p>
                  )}
                </>
              )}

              {/* Datos internacionales */}
              {internacional && (
                <>
                  <p className="dark:text-white">
                    <strong>Sector Productivo:</strong>{" "}
                    {internacional["Sector Productivo"]}
                  </p>
                  {internacional.Warning && (
                    <p className="text-xs text-muted-foreground mt-2 dark:text-white">
                      ⚠️ {internacional.Warning}
                    </p>
                  )}
                </>
              )}

              {/* Sección de costos al final */}
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2 dark:text-white">
                  💰 Costos Totales
                </h3>
                <div className="flex flex-wrap gap-2 dark:text-white">
                  {/* Costos Nacionales */}
                  {nacional && (
                    <>
                      <Badge variant="outline">
                        Tramo ferrocarril: $
                        {Number(
                          nacional["Costos"]["Costo tramo ferrocarril ($)"] ?? 0
                        ).toFixed(2)}
                      </Badge>
                      <Badge variant="outline">
                        Tramo camión: $
                        {Number(
                          nacional["Costos"]["Costo tramo camión ($)"] ?? 0
                        ).toFixed(2)}
                      </Badge>
                    </>
                  )}

                  {/* Costos Internacionales */}
                  {internacional && (
                    <>
                      <Badge variant="outline">
                        Costo Documental Total($USD): $
                        {Number(
                          internacional["Costo Documental Total($USD)"] ?? 0
                        ).toFixed(2)}
                      </Badge>
                      <Badge variant="outline">
                        Costo Transporte Internacional($USD): $
                        {Number(
                          internacional[
                            "Costo Transporte Internacional($USD)"
                          ] ?? 0
                        ).toFixed(2)}
                      </Badge>
                    </>
                  )}

                  {/* Cálculo de total combinado */}
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-white"
                  >
                    Total combinado: $
                    {(
                      Number(
                        nacional?.["Costos"]["Costo tramo ferrocarril ($)"] ?? 0
                      ) +
                      Number(
                        nacional?.["Costos"]["Costo tramo camión ($)"] ?? 0
                      ) +
                      Number(
                        internacional?.["Costo tramo ferrocarril ($)"] ?? 0
                      ) +
                      Number(internacional?.["Costo tramo camión ($)"] ?? 0)
                    ).toFixed(2)}
                  </Badge>
                </div>
              </div>
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
