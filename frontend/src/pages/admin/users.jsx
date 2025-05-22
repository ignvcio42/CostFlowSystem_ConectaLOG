import React, { useEffect, useState } from "react";
import api from "../../libs/api_calls";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import useStore from "@/store";

const UsuariosAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState(null);
  const { user } = useStore((state) => state);

  const fetchUsuarios = async () => {
    try {
      const response = await api.get("/user/admin/users");
      setUsuarios(response.data.users || []);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstadoUsuario = async (id, nuevo_estado, comentario = "") => {
    try {
      setActualizando(id);
      await api.put(`/user/admin/users/${id}/estado`, {
        nuevo_estado,
        comentario,
      });
      await fetchUsuarios();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      alert("No se pudo actualizar el estado del usuario.");
    } finally {
      setActualizando(null);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const usuariosPendientes = usuarios.filter((u) => u.estado === false);
  const usuariosActivosInactivos = usuarios.filter((u) => u.estado === true);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold dark:text-white">
        Gestión de Usuarios
      </h2>

      {/* Sección: Usuarios esperando ser aceptados */}
      <section>
        <h3 className="text-xl font-semibold mb-2 dark:text-white">
          Usuarios esperando ser aceptados
        </h3>
        {usuariosPendientes.length === 0 ? (
          <p className="text-muted-foreground dark:text-white">
            No hay usuarios esperando aprobación.
          </p>
        ) : (
          usuariosPendientes.map((usuario) => (
            <Card key={usuario.id} className="p-4 mt-2 shadow dark:bg-muted transition-all duration-300 ">
              <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="font-semibold dark:text-white">
                    Nombre: {usuario.firstname} {usuario.lastname}
                  </p>
                  <p className="text-sm text-muted-foreground dark:text-white">
                    Correo: {usuario.email}
                  </p>
                  <Badge className="mt-2 bg-yellow-500 rounded">
                    Pendiente
                  </Badge>
                </div>
                <div className="flex flex-col md:flex-row gap-2 dark:text-white dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 rounded">
                  <Button
                    className="dark:text-white dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 rounded"
                    disabled={actualizando === usuario.id}
                    onClick={() =>
                      cambiarEstadoUsuario(
                        usuario.id,
                        true,
                        `Aprobado por admin ${user.firstname}`
                      )
                    }
                  >
                    Aceptar
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={actualizando === usuario.id}
                    onClick={() =>
                      cambiarEstadoUsuario(
                        usuario.id,
                        false,
                        `Rechazado por admin ${user.firstname}`
                      )
                    }
                  >
                    Rechazar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </section>

      {/* Sección: Estado de los usuarios */}
      <section>
        <h3 className="text-xl font-semibold mb-2 dark:text-white">Estado de los usuarios</h3>
        {usuariosActivosInactivos.length === 0 ? (
          <p className="text-muted-foreground">
            No hay usuarios activos o inactivos.
          </p>
        ) : (
          usuariosActivosInactivos.map((usuario) => (
            <Card key={usuario.id} className="p-2 mt-2 shadow">
              <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="font-semibold dark:text-white">
                    Nombre: {usuario.firstname} {usuario.lastname}
                  </p>
                  <p className="text-sm text-muted-foreground dark:text-white">
                    Correo: {usuario.email}
                  </p>
                  <Badge
                    className={`mt-2 ${
                      usuario.estado
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-red-500 hover:bg-red-600"
                    } rounded`}
                  >
                    Estado: {usuario.estado ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <Button
                  className="dark:text-white dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 rounded"
                  disabled={actualizando === usuario.id}
                  variant={usuario.estado ? "destructive" : "default"}
                  onClick={() =>
                    cambiarEstadoUsuario(
                      usuario.id,
                      !usuario.estado,
                      `Cambio realizado por admin ${user.firstname}`
                    )
                  }
                >
                  {actualizando === usuario.id
                    ? "Actualizando..."
                    : usuario.estado
                    ? "Deshabilitar"
                    : "Habilitar"}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  );
};

export default UsuariosAdmin;
