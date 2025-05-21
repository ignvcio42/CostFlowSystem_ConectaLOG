import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "@/libs/api_calls";
import { toast } from "sonner";

export default function ProcessVerifyEmail() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [wasJustVerified, setWasJustVerified] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setResult({ ok: false, message: "Token missing." });
      setLoading(false);
      setShowResend(true);
      return;
    }

    api.get(`/auth/verify-email?token=${token}`)
      .then(({ data }) => {
        setResult({ ok: true, message: data.message });
        setWasJustVerified(true); // <- Indica que fue recién verificado
        toast.success(data.message);
        setTimeout(() => navigate("/sign-in"), 2500);
      })
      .catch((err) => {
        setResult({ ok: false, message: err?.response?.data?.message || "Something went wrong" });
        setShowResend(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Ingresa tu correo para reenviar el enlace.");
      return;
    }
    setResendLoading(true);
    try {
      const { data } = await api.post("/auth/resend-verification", { email });
      toast.success(data.message || "Correo reenviado correctamente.");
      setShowResend(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "No se pudo reenviar el correo.");
    } finally {
      setResendLoading(false);
    }
  };

  // ---- FIX: Si acaba de verificar, muestra SOLO el mensaje de redirección y nada más ----
  if (wasJustVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-slate-900">
        <div className="bg-white dark:bg-[#222c38] rounded-xl p-8 shadow text-center w-full max-w-md">
          <h2 className="text-2xl mb-4 text-green-600 dark:text-green-400">¡Correo verificado!</h2>
          <p className="mb-4 dark:text-white">
            Ahora puedes iniciar sesión, cuando el admin active tu cuenta.<br />
            <b>Serás redirigido al login en unos segundos...</b>
          </p>
          <div className="mt-6 flex justify-center">
            <span className="loader inline-block w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  // ---- El resto del render ----
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-slate-900">
      <div className="bg-white dark:bg-[#222c38] rounded-xl p-8 shadow text-center w-full max-w-md">
        {loading ? (
          <p className="text-lg dark:text-white">Verificando tu correo...</p>
        ) : result?.ok ? (
          // Este bloque no se debería mostrar nunca porque wasJustVerified cubre el caso OK real
          null
        ) : (
          <>
            <h2 className="text-2xl mb-4 text-red-600 dark:text-red-400">Error</h2>
            <p className="mb-2 dark:text-white">
              {result?.message}
              {result?.message === "Token inválido o expirado." && (
                <span>
                  <br />
                  Si ya verificaste tu correo previamente, solo inicia sesión.<br />
                  Si no, puedes reenviar el enlace aquí:
                </span>
              )}
            </p>
            <button
              onClick={() => navigate("/sign-in")}
              className="mt-4 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-300 transition"
            >
              Ir al login
            </button>
            {showResend && (
              <form className="mt-6 space-y-3" onSubmit={handleResend}>
                <input
                  className="w-full px-3 py-2 rounded-md border dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  type="email"
                  placeholder="Ingresa tu correo"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={resendLoading}
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                  disabled={resendLoading}
                >
                  {resendLoading ? "Reenviando..." : "Reenviar enlace"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
