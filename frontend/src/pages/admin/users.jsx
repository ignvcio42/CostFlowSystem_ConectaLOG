import React, { useEffect, useState } from "react";
import api from "../../libs/api_calls";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import useStore from "@/store";
import { ArrowDown, ArrowUp } from "lucide-react"; // O cualquier ícono de flecha
import { toast } from "sonner";
import { HistorialModalAdmin } from "./HistorialModalAdmin";

const estados = [
  { value: "todos", label: "Todos" },
  { value: "pendiente", label: "Pendientes" },
  { value: "aceptado", label: "Aceptados" },
  { value: "deshabilitado", label: "Deshabilitados" },
  { value: "rechazado", label: "Rechazados" },
];

const cerrarHistorial = () => {
  setUsuarioHistorial(null);
  setHistorial([]);
};

function badgeColor(motivo) {
  switch (motivo) {
    case "pendiente":
      return "bg-yellow-500 hover:bg-yellow-600";
    case "aceptado":
      return "bg-green-500 hover:bg-green-600";
    case "deshabilitado":
      return "bg-gray-500 hover:bg-gray-600";
    case "rechazado":
      return "bg-red-600 hover:bg-red-700";
    default:
      return "bg-gray-300";
  }
}

// --- Componente principal ---
export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const { user } = useStore((state) => state);

  // Estados para modal de historial
  const [usuarioHistorial, setUsuarioHistorial] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  // Función para abrir historial
  const handleVerHistorial = async (usuario) => {
    setUsuarioHistorial(usuario);
    setLoadingHistorial(true);
    try {
      const res = await api.get(
        `/consultas-historicas/admin/historial/${usuario.id}`
      );
      console.log("Historial de consultas:", res.data);
      setHistorial(res.data || []);
    } catch (e) {
      toast.error("No se pudo obtener el historial");
    }
    setLoadingHistorial(false);
  };

  const cerrarHistorial = () => {
    setUsuarioHistorial(null);
    setHistorial([]);
  };

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const usuariosPorPagina = 10;

  // Orden
  const [orderBy, setOrderBy] = useState("createdat");
  const [orderDirection, setOrderDirection] = useState("desc");

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await api.get("/user/admin/users");
      setUsuarios(response.data.users || []);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstadoUsuario = async (
    id,
    nuevo_estado,
    motivo_estado,
    comentario = "",
    mensajeToast
  ) => {
    try {
      setActualizando(id);
      await api.put(`/user/admin/users/${id}/estado`, {
        nuevo_estado,
        motivo_estado,
        comentario,
      });
      toast.success(mensajeToast);
      await fetchUsuarios();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "No se pudo actualizar el estado del usuario."
      );
      console.error("Error al cambiar estado:", error);
      alert("No se pudo actualizar el estado del usuario.");
    } finally {
      setActualizando(null);
    }
  };

  useEffect(() => {
    fetchUsuarios();
    // eslint-disable-next-line
  }, []);

  // Filtro y búsqueda
  const usuariosFiltrados = usuarios.filter((u) => {
    const byEstado =
      filtroEstado === "todos" || u.motivo_estado === filtroEstado;
    const query = busqueda.toLowerCase();
    const byBusqueda =
      u.firstname.toLowerCase().includes(query) ||
      (u.lastname && u.lastname.toLowerCase().includes(query)) ||
      u.email.toLowerCase().includes(query);
    return byEstado && byBusqueda;
  });

  // Ordenamiento
  const sortedUsuarios = [...usuariosFiltrados].sort((a, b) => {
    let campoA = a[orderBy];
    let campoB = b[orderBy];

    // Orden por fecha
    if (orderBy === "createdat") {
      campoA = new Date(campoA);
      campoB = new Date(campoB);
    } else {
      campoA = campoA ? campoA.toString().toLowerCase() : "";
      campoB = campoB ? campoB.toString().toLowerCase() : "";
    }

    if (campoA < campoB) return orderDirection === "asc" ? -1 : 1;
    if (campoA > campoB) return orderDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Paginación
  const totalPaginas = Math.ceil(sortedUsuarios.length / usuariosPorPagina);
  const usuariosPagina = sortedUsuarios.slice(
    (currentPage - 1) * usuariosPorPagina,
    currentPage * usuariosPorPagina
  );

  const cambiarOrden = (campo) => {
    if (orderBy === campo) {
      setOrderDirection(orderDirection === "asc" ? "desc" : "asc");
    } else {
      setOrderBy(campo);
      setOrderDirection("asc");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold dark:text-white">
        Gestión de Usuarios
      </h2>
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select
          className="p-2 rounded border dark:bg-black/20 dark:text-white"
          value={filtroEstado}
          onChange={(e) => {
            setFiltroEstado(e.target.value);
            setCurrentPage(1); // reset page al cambiar filtro
          }}
        >
          {estados.map((e) => (
            <option key={e.value} value={e.value} className="dark:bg-black/20 dark:text-black">
              {e.label}
            </option>
          ))}
        </select>
        <input
          className="p-2 rounded border dark:bg-white dark:text-black"
          type="text"
          placeholder="Buscar por nombre o correo"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setCurrentPage(1); // reset page al buscar
          }}
        />
        <Button
          className="ml-auto dark:text-white dark:bg-black/20 hover:bg-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 rounded"
          onClick={fetchUsuarios}
          variant="outline"
        >
          Actualizar
        </Button>
      </div>

      {/* Tabla o lista de usuarios */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white dark:bg-muted rounded-xl overflow-hidden shadow dark:shadow-slate-800 border dark:border-slate-700">
          <thead>
            <tr className="bg-gray-200 dark:bg-black/20 text-gray-700 dark:text-white">
              <th
                className="p-3 text-left cursor-pointer select-none"
                onClick={() => cambiarOrden("firstname")}
              >
                Nombre
                {orderBy === "firstname" &&
                  (orderDirection === "asc" ? (
                    <ArrowUp className="inline w-4 h-4 ml-1" />
                  ) : (
                    <ArrowDown className="inline w-4 h-4 ml-1" />
                  ))}
              </th>
              <th
                className="p-3 text-left cursor-pointer select-none"
                onClick={() => cambiarOrden("email")}
              >
                Correo
                {orderBy === "email" &&
                  (orderDirection === "asc" ? (
                    <ArrowUp className="inline w-4 h-4 ml-1" />
                  ) : (
                    <ArrowDown className="inline w-4 h-4 ml-1" />
                  ))}
              </th>
              <th
                className="p-3 text-left cursor-pointer select-none"
                onClick={() => cambiarOrden("createdat")}
              >
                Ingreso
                {orderBy === "createdat" &&
                  (orderDirection === "asc" ? (
                    <ArrowUp className="inline w-4 h-4 ml-1" />
                  ) : (
                    <ArrowDown className="inline w-4 h-4 ml-1" />
                  ))}
              </th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-left">Acción</th>
            </tr>
          </thead>
          <tbody>
            {usuariosPagina.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-6 text-center text-gray-500 dark:text-gray-300 dark:bg-slate-800"
                >
                  No hay usuarios para mostrar.
                </td>
              </tr>
            ) : (
              usuariosPagina.map((usuario) => (
                <tr
                  key={usuario.id}
                  className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-900 transition"
                >
                  <td className="p-3 font-medium dark:text-white">
                    {usuario.firstname} {usuario.lastname}
                  </td>
                  <td className="p-3 dark:text-white">{usuario.email}</td>
                  <td className="p-3 dark:text-white">
                    {/* Fecha de ingreso */}
                    {usuario.createdat
                      ? new Date(usuario.createdat).toLocaleDateString()
                      : ""}
                  </td>
                  <td className="p-3">
                    <Badge
                      className={badgeColor(usuario.motivo_estado) + " rounded"}
                    >
                      {usuario.motivo_estado.charAt(0).toUpperCase() +
                        usuario.motivo_estado.slice(1)}
                    </Badge>
                  </td>
                  <td className="p-3 space-x-2">
                    {/* Acciones según estado */}
                    {usuario.motivo_estado === "pendiente" && (
                      <>
                        <Button
                          className="dark:text-white dark:bg-gray-800 hover:bg-green-200 dark:border-gray-700 dark:hover:bg-green-200 dark:hover:text-gray-900 rounded"
                          disabled={actualizando === usuario.id}
                          onClick={() =>
                            cambiarEstadoUsuario(
                              usuario.id,
                              true,
                              "aceptado",
                              `Aprobado por administrador ${user.firstname}`,
                              `Usuario ${usuario.firstname} aceptado correctamente`
                            )
                          }
                        >
                          Aceptar
                        </Button>
                        <Button
                          className="dark:text-white dark:bg-gray-800 hover:bg-red-200 dark:border-gray-700 dark:hover:bg-red-200 dark:hover:text-gray-900 rounded"
                          variant="destructive"
                          disabled={actualizando === usuario.id}
                          onClick={() =>
                            cambiarEstadoUsuario(
                              usuario.id,
                              false,
                              "rechazado",
                              `Rechazado por administrador ${user.firstname}`,
                              `Usuario ${usuario.firstname} rechazado correctamente`
                            )
                          }
                        >
                          Rechazar
                        </Button>
                      </>
                    )}

                    {usuario.motivo_estado === "aceptado" && (
                      <Button
                        className="dark:text-white dark:bg-gray-800 hover:bg-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 rounded"
                        variant="destructive"
                        disabled={actualizando === usuario.id}
                        onClick={() =>
                          cambiarEstadoUsuario(
                            usuario.id,
                            false,
                            "deshabilitado",
                            `Deshabilitado por administrador ${user.firstname}`,
                            `Usuario ${usuario.firstname} deshabilitado correctamente`
                          )
                        }
                      >
                        Deshabilitar
                      </Button>
                    )}

                    {usuario.motivo_estado === "deshabilitado" && (
                      <Button
                        className="dark:text-white dark:bg-gray-800 hover:bg-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 rounded"
                        disabled={actualizando === usuario.id}
                        onClick={() =>
                          cambiarEstadoUsuario(
                            usuario.id,
                            true,
                            "aceptado",
                            `Rehabilitado por administrador ${user.firstname}`,
                            `Usuario ${usuario.firstname} rehabilitado correctamente`
                          )
                        }
                      >
                        Habilitar
                      </Button>
                    )}

                    {usuario.motivo_estado === "rechazado" && (
                      <Button
                        className="dark:text-white dark:bg-gray-800 hover:bg-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 rounded"
                        disabled={actualizando === usuario.id}
                        onClick={() =>
                          cambiarEstadoUsuario(
                            usuario.id,
                            false,
                            "pendiente",
                            `Usuario reenviado a revisión por admin ${user.firstname}`,
                            `Usuario ${usuario.firstname} marcado como pendiente`
                          )
                        }
                      >
                        Marcar como pendiente
                      </Button>
                    )}
                    {usuario.motivo_estado === "aceptado" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="dark:text-white hover:bg-cyan-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-cyan-200 dark:hover:text-gray-900 rounded"
                        onClick={() => handleVerHistorial(usuario)}
                      >
                        Ver historial
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-center mt-4 gap-2">
        <Button
          className="dark:text-white dark:bg-black/20 hover:bg-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 rounded"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          variant="outline"
        >
          Anterior
        </Button>
        <span className="mx-2 text-sm dark:text-white">
          Página {currentPage} de {totalPaginas}
        </span>
        <Button
          className="dark:text-white dark:bg-black/20 hover:bg-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 rounded"
          disabled={currentPage === totalPaginas || totalPaginas === 0}
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPaginas))}
          variant="outline"
        >
          Siguiente
        </Button>
      </div>
      <HistorialModalAdmin
        usuarioHistorial={usuarioHistorial}
        cerrarHistorial={cerrarHistorial}
        loadingHistorial={loadingHistorial}
        historial={historial}
      />
    </div>
  );
}
