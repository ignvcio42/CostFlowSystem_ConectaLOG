// src/pages/ForgotPassword.jsx
import { useState } from "react";
import api from "@/libs/api_calls";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/request-password-reset", { email });
      toast.success("Revisa tu correo para recuperar tu contraseña.");
      setSent(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "No se pudo enviar el correo.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-slate-900">
      <div className="bg-white dark:bg-[#222c38] rounded-xl p-8 shadow text-center w-full max-w-md">
        <h2 className="text-2xl mb-4 dark:text-white">¿Olvidaste tu contraseña?</h2>
        {sent ? (
          <p className="dark:text-white">Revisa tu correo y sigue el enlace para cambiar tu contraseña.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              className="w-full px-3 py-2 rounded-md border dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              placeholder="Correo electrónico"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition dark:bg-white dark:text-black dark:hover:bg-gray-200"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar enlace"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
