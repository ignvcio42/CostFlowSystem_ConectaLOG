import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HistorialCardAdmin } from "./HistorialCardAdmin"; // Asegúrate de la ruta

export function HistorialModalAdmin({
  usuarioHistorial,
  cerrarHistorial,
  loadingHistorial,
  historial,
}) {
  if (!usuarioHistorial) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
      <Card className="w-full md:w-1/2 max-h-[80vh] overflow-auto rounded-2xl shadow-2xl border-2 border-gray-300 dark:border-gray-700 relative bg-white dark:bg-slate-900">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-xl dark:text-white">
                Historial de {usuarioHistorial.firstname} {usuarioHistorial.lastname}
              </h3>
              <span className="text-sm text-gray-500">
                {usuarioHistorial.email}
              </span>
            </div>
            <Button
              className="dark:text-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
              onClick={cerrarHistorial}
            >
              Cerrar
            </Button>
          </div>
          {loadingHistorial ? (
            <Skeleton className="h-40 w-full rounded" />
          ) : (
            <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-2">
              {historial.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-300">
                  Sin consultas realizadas.
                </div>
              ) : (
                historial.map((consulta, idx) => (
                  <HistorialCardAdmin
                    key={consulta.historial_id || idx}
                    consulta={consulta}
                    idx={idx}
                  />
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
