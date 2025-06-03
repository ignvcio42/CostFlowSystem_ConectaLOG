import { Card, CardContent } from "@/components/ui/card";

export function HistorialCardAdmin({ consulta, idx }) {
  return (
    <Card
      className={`
        mb-2 border-l-4 border-blue-500 shadow
        transition-all duration-200
        bg-white dark:bg-slate-800
        hover:bg-blue-50 dark:hover:bg-slate-700
        hover:shadow-md
        cursor-pointer
        rounded-xl
      `}
    >
      <CardContent className="p-4">
        <p className="text-sm font-semibold mb-2 dark:text-white">
          <u>Consulta #{idx + 1}</u> - {new Date(consulta.fecha_consulta).toLocaleString()}
        </p>

        {/* Nacional */}
        {consulta.respuesta_json?.Nacional && (
          <>
            <p className="dark:text-white text-sm mb-1">
              <strong>Origen:</strong>{" "}
              {consulta.respuesta_json.Nacional["origen local"] ?? consulta.comuna}
            </p>
            <p className="dark:text-white text-sm mb-1">
              <strong>Destino:</strong>{" "}
              {consulta.respuesta_json.Nacional["destino local"] ??
                consulta.puerto ?? consulta.puerto_ext ?? "-"}
            </p>
            <p className="dark:text-white text-sm mb-1">
              <strong>Capítulo:</strong>{" "}
              {consulta.respuesta_json.Nacional.producto?.Capitulo ?? "-"}
            </p>
            <p className="dark:text-white text-sm mb-1">
              <strong>Producto:</strong>{" "}
              {consulta.respuesta_json.Nacional.producto?.Partida ??
                consulta.producto ?? "-"}
            </p>
            {consulta.respuesta_json.Nacional.producto?.Glosa && (
              <p className="dark:text-white text-sm mb-1">
                <strong>Glosa:</strong>{" "}
                {consulta.respuesta_json.Nacional.producto.Glosa}
              </p>
            )}
          </>
        )}

        {/* Internacional */}
        {consulta.respuesta_json?.Internacional && (
          <p className="dark:text-white text-sm mb-1">
            <strong>Sector Productivo:</strong>{" "}
            {consulta.respuesta_json.Internacional["Sector Productivo"] ?? "-"}
          </p>
        )}

        {/* Modo de Transporte */}
        <p className="dark:text-white text-sm mb-1">
          <strong>Modo de Transporte:</strong> {consulta.modo ?? "-"}
        </p>

        {/* Errores */}
        {consulta.respuesta_json?.Internacional?.ERROR && (
          <p className="text-xs text-red-500 mb-1">
            <strong>Error Internacional:</strong>{" "}
            {consulta.respuesta_json.Internacional.ERROR}
          </p>
        )}
        {consulta.respuesta_json?.Nacional?.ERROR && (
          <p className="text-xs text-red-500 mb-1">
            <strong>Error Nacional:</strong>{" "}
            {consulta.respuesta_json.Nacional.ERROR}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
