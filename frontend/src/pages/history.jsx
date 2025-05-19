import React, { useEffect, useState } from "react";
import api from "../libs/api_calls";
import useStore from "@/store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import HistorialFilter from "@/components/historial/HistorialFilter";

const History = () => {
  const [historial, setHistorial] = useState([]);
  const [error, setError] = useState("");
  const { user } = useStore((state) => state);
  const [selected, setSelected] = useState([]);

  // Filtros
  const [filters, setFilters] = useState({
    fecha: "",
    origen: "",
    destino: "",
    capitulo: "",
    producto: "",
  });

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

  function getLocalDateStringFromUTC(dateStringUTC) {
    if (!dateStringUTC) return "";
    const d = new Date(dateStringUTC);
    // Ajusta a tu zona horaria local
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Filtrar historial según filtros
  const filteredHistorial = historial.filter((consulta) => {
    const nacional = consulta.respuesta_json?.Nacional;

    // FECHA (YYYY-MM-DD)
    const consultaFecha = getLocalDateStringFromUTC(consulta.fecha_consulta);
    const fechaMatch = !filters.fecha || consultaFecha === filters.fecha;

    // ORIGEN
    const origenMatch =
      !filters.origen ||
      (nacional &&
        nacional["origen local"]
          ?.toLowerCase()
          .includes(filters.origen.toLowerCase()));

    // DESTINO
    const destinoMatch =
      !filters.destino ||
      (nacional &&
        nacional["destino local"]
          ?.toLowerCase()
          .includes(filters.destino.toLowerCase()));

    // CAPITULO
    const capituloMatch =
      !filters.capitulo ||
      (nacional &&
        nacional.producto?.Capitulo?.toString()
          .toLowerCase()
          .includes(filters.capitulo.toLowerCase()));

    // PRODUCTO: busca en columna producto O en nacional.producto.Partida
    const productoMatch =
      !filters.producto ||
      (consulta.producto &&
        consulta.producto
          .toString()
          .toLowerCase()
          .includes(filters.producto.toLowerCase())) ||
      (nacional &&
        nacional.producto?.Partida?.toString()
          .toLowerCase()
          .includes(filters.producto.toLowerCase()));

    return (
      fechaMatch &&
      origenMatch &&
      destinoMatch &&
      capituloMatch &&
      productoMatch
    );
  });

  const renderConsulta = (consulta, index) => {
    const nacional = consulta.respuesta_json?.Nacional;
    const internacional = consulta.respuesta_json?.Internacional;
    return (
      <Card
        key={consulta.historial_id}
        className="dark:bg-muted bg-white p-4 rounded-xl shadow transition-all duration-300"
      >
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            checked={selected.includes(consulta.historial_id)}
            onChange={() => {
              setSelected((prev) =>
                prev.includes(consulta.historial_id)
                  ? prev.filter((id) => id !== consulta.historial_id)
                  : [...prev, consulta.historial_id]
              );
            }}
            className="mr-2 accent-blue-600 w-5 h-5"
          />
          <span className="text-sm text-muted-foreground dark:text-white">
            Seleccionar para ejecutar consultas múltiples
          </span>
        </div>

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
        <button
          className="mt-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => reejecutarConsulta(consulta)}
        >
          Re-ejecutar esta consulta
        </button>
      </Card>
    );
  };

  // Recibe como parámetro una consulta del historial (como las que ya tienes en el render)
  const reejecutarConsulta = async (consulta) => {
    // Construye el objeto de parámetros con los datos de la consulta
    const params = {
      producto: consulta.producto,
      carga: consulta.carga,
      modo: consulta.modo,
      toneladas: consulta.toneladas,
      importacion: consulta.importacion,
      comuna: consulta.comuna,
      puerto: consulta.puerto,
      puerto_ext: consulta.puerto_ext,
      pais: consulta.pais,
      cargapeligrosa: consulta.cargapeligrosa,
    };

    try {
      await api.post("/consultas-historicas/reejecutar-consulta", params);
      toast.success("Consulta ejecutada nuevamente");
      console.log("params enviados:", params);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      toast.error(
        "No se pudo ejecutar la consulta (verifica si la API externa está disponible)"
      );
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const reejecutarMultiplesConsultas = async () => {
    try {
      const consultasSeleccionadas = historial.filter((c) =>
        selected.includes(c.historial_id)
      );
      await Promise.all(
        consultasSeleccionadas.map((consulta) => {
          const params = {
            producto: String(consulta.producto ?? ""),
            carga: Number(consulta.carga ?? 0),
            modo: String(consulta.modo ?? ""),
            toneladas: Number(consulta.toneladas ?? 0),
            importacion: Number(consulta.importacion ?? 0),
            comuna: Number(consulta.comuna ?? 0),
            puerto: Number(consulta.puerto ?? 0),
            puerto_ext: Number(consulta.puerto_ext ?? 0),
            pais: Number(consulta.pais ?? 0),
            cargapeligrosa: Number(consulta.cargapeligrosa ?? 0),
          };
          console.log("Params enviados:", params);
          return api.post("/consultas-historicas/reejecutar-consulta", params);
        })
      );
      toast.success("Consultas ejecutadas nuevamente");
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      toast.error("Error al ejecutar las consultas seleccionadas");
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h2 className="text-3xl font-bold mb-6 text-center dark:text-white">
        Historial de Consultas
      </h2>
      {/* Filtro */}
      <HistorialFilter filters={filters} setFilters={setFilters} />
      {selected.length > 0 && (
        <button
          className="mb-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          onClick={async () => {
            await reejecutarMultiplesConsultas();
            setSelected([]); // Limpia la selección después de ejecutar
          }}
        >
          Ejecutar {selected.length} consulta{selected.length > 1 ? "s" : ""}{" "}
          seleccionada{selected.length > 1 ? "s" : ""}
        </button>
      )}

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {historial.length === 0 ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 ">
          {filteredHistorial.map((consulta, index) =>
            renderConsulta(consulta, index)
          )}
        </div>
      )}
    </div>
  );
};

export default History;
