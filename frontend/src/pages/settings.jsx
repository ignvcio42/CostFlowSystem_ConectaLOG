import React, { useState } from "react";
import useStore from "../store";
import { SettingForm } from "@/components/SettingForm";
import ChangePassword from "@/components/change-password";
import api from "@/libs/api_calls";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ActualizacionDatos from "@/components/Actualizacion-datos";

const Settings = () => {
  const { user, setCredentails } = useStore((state) => state);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();

  // Handler para baja voluntaria
  const handleDisableAccount = async () => {
    setLoading(true);
    try {
      await api.put("/user/disable", { comentario: "Baja solicitada por el usuario" });
      toast.success("Cuenta deshabilitada. ¡Hasta pronto!");
      // Limpiar sesión local
      localStorage.removeItem("user");
      setCredentails(null);
      setTimeout(() => {
        navigate("/sign-in");
      }, 1300);
    } catch (err) {
      toast.error("No se pudo procesar la baja.");
    }
    setLoading(false);
    setOpenModal(false);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-4xl px-4 py-4 my-6 shadow-lg bg-gray-50 dark:bg-black/20 md:px-10 md:my-10 rounded-xl transition-all duration-300">
        <div className="mt-6 p-4 border-b-2 border-gray-200 dark:border-gray-800 transition-all duration-300">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white">
            Settings
          </h2>
        </div>

        <div className="py-10">
          <p className="text-lg font-bold text-black dark:text-white">
            Profile information
          </p>
          <div className="flex items-center gap-4 my-8">
            <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center text-2xl font-bold text-white dark:text-white cursor-pointer">
              <p>{user?.firstname.charAt(0)}</p>
            </div>
            <p className="text-2xl font-semibold text-black dark:text-gray-400">
              {user?.firstname} {user?.lastname}
            </p>
          </div>
          <SettingForm />
        {/* Sección de Actualizacion de datso historicos */}
        <ActualizacionDatos />

          {!user?.provided && <ChangePassword />}
        </div>


        {/* Botón para abrir modal */}
        <div className="flex justify-end mt-8">
          <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger asChild>
              <Button
                className="bg-red-600 text-white px-6 py-2 hover:bg-red-700 transition disabled:opacity-60 rounded"
                disabled={loading}
              >
                Darse de baja
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md dark:bg-[#18181b] bg-white">
              <DialogHeader>
                <DialogTitle className="text-red-600 dark:text-red-400">¿Estás seguro?</DialogTitle>
              </DialogHeader>
              <div className="py-3 text-gray-700 dark:text-gray-200">
                <p>
                  <b>Esta acción deshabilitará tu cuenta.</b>
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  No podrás iniciar sesión hasta que un administrador la habilite nuevamente.<br />
                  ¿Deseas continuar?
                </p>
              </div>
              <DialogFooter className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  className="rounded dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-700 dark:hover:bg-gray-600 text-gray-800" 
                  onClick={() => setOpenModal(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white rounded"
                  onClick={handleDisableAccount}
                  disabled={loading}
                >
                  {loading ? "Procesando..." : "Darse de baja"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default Settings;
