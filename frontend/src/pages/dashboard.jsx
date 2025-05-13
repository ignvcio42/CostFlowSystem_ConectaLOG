import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../libs/api_calls";
import useStore from "@/store";
import { normalizeQuery } from "@/libs/normalizeQuery";
import QueryForm from "@/components/formulario/queryForm";
import FormControls from "@/components/formulario/formControls";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const emptyQuery = {
  producto: "",
  carga: 2,
  modo: "Ferrocarril",
  toneladas: 1,
  importacion: 0,
  comuna: "",
  puerto: "",
  puerto_ext: "",
  pais: "",
  cargapeligrosa: 0,
};

const Dashboard = () => {
  const [queries, setQueries] = useState([structuredClone(emptyQuery)]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const { user } = useStore((state) => state);

  const handleChange = (index, e) => {
    const { name, value, type } = e.target;
    const newQueries = [...queries];
    newQueries[index][name] = type === "number" ? parseInt(value) || "" : value;
    setQueries(newQueries);
  };

  const addQuery = () => {
    setQueries([...queries, structuredClone(emptyQuery)]);
  };

  const removeQuery = (index) => {
    if (queries.length === 1) return;
    const newQueries = queries.filter((_, i) => i !== index);
    setQueries(newQueries);
  };

  const clearAll = () => {
    setQueries([structuredClone(emptyQuery)]);
    toast.success("Formulario reiniciado");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError("");

    try {
      const responses = await Promise.all(
        queries.map((q) => {
          const normalizada = normalizeQuery(q);
          return api.post("/consultas-historicas/consultar", normalizada);
        })
      );
      // Aquí podrías guardar en el store o enviar a history con estado
      toast.success("Consultas realizadas con éxito");
      setTimeout(() => {
        navigate("/history");
      }, 3000);
    } catch (err) {
      console.error(err);
      setError("Error en alguna de las consultas.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 p-6 border rounded-xl shadow-lg bg-white dark:bg-muted dark:text-white transition-all duration-300">
      <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Consulta de Transporte Multimodal</h2>
      <form onSubmit={handleSubmit}>
        {queries.map((query, index) => (
          <QueryForm
            key={index}
            index={index}
            query={query}
            handleChange={handleChange}
            removeQuery={removeQuery}
            isOnly={queries.length === 1}
          />
        ))}
        <FormControls
          addQuery={addQuery}
          handleSubmit={handleSubmit}
          cargando={cargando}
          clearAll={clearAll}
          queriesCount={queries.length}
        />
      </form>
      {error && <p className="text-red-600 mt-4">{error}</p>}

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default Dashboard;