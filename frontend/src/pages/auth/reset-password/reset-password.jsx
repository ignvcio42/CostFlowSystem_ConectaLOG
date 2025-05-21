// src/pages/ResetPassword.jsx
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "@/libs/api_calls";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// SCHEMA de validación con confirmación de contraseña
const ResetPasswordSchema = z.object({
  newPassword: z.string({ required_error: "La contraseña es requerida" })
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string({ required_error: "Confirma tu contraseña" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const token = searchParams.get("token");

  // Hook form con zod
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(ResetPasswordSchema),
  });

  const onSubmit = async ({ newPassword }) => {
    if (!token) {
      toast.error("Enlace inválido o expirado.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword });
      toast.success("Contraseña cambiada con éxito. Ya puedes iniciar sesión.");
      setDone(true);
      setTimeout(() => navigate("/sign-in"), 2500);
    } catch (err) {
      toast.error(err?.response?.data?.message || "No se pudo cambiar la contraseña.");
      reset();
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-slate-900">
      <div className="bg-white dark:bg-[#222c38] rounded-xl p-8 shadow text-center w-full max-w-md">
        <h2 className="text-2xl mb-4 dark:text-white">Restablecer contraseña</h2>
        {done ? (
          <p className="dark:text-white">¡Contraseña cambiada! Serás redirigido al login.</p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                type="password"
                className="w-full px-3 py-2 rounded-md border dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                placeholder="Nueva contraseña"
                {...register("newPassword")}
                disabled={loading}
              />
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
              )}
            </div>
            <div>
              <input
                type="password"
                className="w-full px-3 py-2 rounded-md border dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                placeholder="Confirma tu nueva contraseña"
                {...register("confirmPassword")}
                disabled={loading}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition dark:bg-white dark:text-black dark:hover:bg-gray-200"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Cambiar contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
