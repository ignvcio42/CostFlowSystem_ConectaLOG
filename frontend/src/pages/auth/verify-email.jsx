export default function VerifyEmail() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-slate-900">
      <div className="bg-white dark:bg-[#222c38] rounded-xl p-8 shadow text-center w-full max-w-md">
        <h2 className="text-2xl mb-4 text-blue-600 dark:text-blue-400">Revisa tu correo</h2>
        <p className="mb-2 dark:text-white">Te enviamos un enlace de verificación.</p>
        <p className="text-gray-500 dark:text-gray-300">
          Haz click en el enlace de tu email para activar tu cuenta.
        </p>
      </div>
    </div>
  );
}
