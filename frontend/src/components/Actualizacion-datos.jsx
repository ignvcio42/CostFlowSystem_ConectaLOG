import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "@/libs/api_calls";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const opcionesMeses = [
  { label: "1 mes", value: "1" },
  { label: "2 meses", value: "2" },
  { label: "3 meses", value: "3" },
  { label: "6 meses", value: "6" },
  { label: "12 meses", value: "12" },
];

export default function ActualizacionDatos() {
  const [loading, setLoading] = useState(false);
  const [meses, setMeses] = useState(null); // Ahora parte vacío

  // 🧠 Obtener valor actual desde backend
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get("/user/periodo-validez");
        const valor = res.data?.periodo_validez_meses;
        console.log("Valor recibido desde backend:", valor);
        if (valor) setMeses(valor.toString());
      } catch (err) {
        console.error("No se pudo cargar configuración del usuario");
      }
    };
    fetchConfig();
  }, []);

  const handleActualizar = async () => {
    setLoading(true);
    try {
      await api.post("/user/actualizar-datos", {
        periodo_validez_meses: parseInt(meses),
      });
      toast.success("Datos actualizados correctamente.");
    } catch (error) {
      toast.error("Error al actualizar datos históricos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mt-8 mb-10 border-b border-gray-200 dark:border-gray-700 pb-6 px-2">
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
          Recalcular datos históricos
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Selecciona por cuánto tiempo quieres que tus consultas sean válidas.
        </p>

        <div className="flex items-center gap-3 mt-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Periodo de validez:
          </Label>
          {meses !== null && (
            <Select value={meses} onValueChange={setMeses}>
              <SelectTrigger className="w-[160px] dark:bg-gray-800 dark:text-white">
                <SelectValue placeholder="Selecciona meses" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto hover:shadow-lg bg-white dark:bg-gray-800">
                {opcionesMeses.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="bg-white dark:bg-gray-800 hover:border-gray-300 dark:text-white hover:bg-slate-600">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <Button
        onClick={handleActualizar}
        disabled={loading || !meses}
        className="bg-violet-600 hover:bg-violet-700 text-white dark:bg-violet-700 dark:hover:bg-violet-600 px-6 py-2 rounded mt-4 md:mt-0"
      >
        {loading ? "Actualizando..." : "Actualizar datos históricos"}
      </Button>
    </div>
  );
}
