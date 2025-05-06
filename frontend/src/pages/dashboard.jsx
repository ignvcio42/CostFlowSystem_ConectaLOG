import React, { useState } from "react";
import comunas from "../data/comunas_opciones.json"; // Asegúrate de que la ruta sea correcta
import puertos from "../data/puertos_opciones.json"; // Asegúrate de que la ruta sea correcta
import paises from "../data/paises_opciones.json"; // Asegúrate de que la ruta sea correcta
import { 
  Check, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Search, 
  Loader2 
} from "lucide-react";

// Campos simplificados con configuración más compacta
const CAMPOS_CONFIG = {
  producto: { 
    tipo: "texto", 
    label: "Código Producto", 
    placeholder: "Ej: 08104019",
    required: true
  },
  carga: { 
    tipo: "select", 
    label: "Tipo de Carga", 
    opciones: [
      { value: 1, label: "Granel Liquido" },
      { value: 2, label: "Carga General" },
      { value: 3, label: "Granel Solido" },
      { value: 4, label: "Container Reefer" },
      { value: 5, label: "Container Dry" }
    ]
  },
  modo: { 
    tipo: "select", 
    label: "Modo de Transporte", 
    opciones: [
      { value: "Camión", label: "Camión" },
      { value: "Ferrocarril", label: "Ferrocarril" },
    ]
  },
  toneladas: { 
    tipo: "numero", 
    label: "Toneladas", 
    min: 1
  },
  importacion: { 
    tipo: "radio", 
    label: "Tipo de Operación", 
    opciones: [
      { value: 1, label: "Importación" },
      { value: 0, label: "Exportación" }
    ]
  },
  comuna: { 
    tipo: "select", 
    label: "Código Comuna", 
    placeholder: "Ej: 7101",
    required: true,
    opciones: comunas
  },
  puerto: { 
    tipo: "select", 
    label: "Código Puerto", 
    placeholder: "Ej: 906",
    opciones: puertos
  },
  puerto_ext: { 
    tipo: "texto", 
    label: "Puerto extranjero (opcional)", 
    placeholder: "0",
    defaultValue: "0",
    descripcion: "Ingrese 0 para puerto nacional, 1 para extranjero"
  },
  pais: { 
    tipo: "select", 
    label: "Código País", 
    placeholder: "Ej: 225",
    opciones: paises
  },
  cargapeligrosa: { 
    tipo: "checkbox", 
    label: "Es carga peligrosa" 
  }
};

// Componente de formulario reutilizable
const FormField = ({ tipo, label, value, onChange, error, className = "", opciones, ...props }) => {
  switch (tipo) {
    case "texto":
      return (
        <div className={`mb-4 ${className}`}>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">
            {label} {props.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={value}
            onChange={onChange}
            className={`w-full px-3 py-2 border rounded-md ${error ? "border-red-500" : "border-gray-300"}`}
            {...props}
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      );
    
    case "numero":
      return (
        <div className={`mb-4 ${className}`}>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">
            {label} {props.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="number"
            value={value}
            onChange={onChange}
            className={`w-full px-3 py-2 border rounded-md ${error ? "border-red-500" : "border-gray-300"}`}
            {...props}
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      );
    
    case "select":
      return (
        <div className={`mb-4 ${className}`}>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">
            {label} {props.required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={value}
            onChange={onChange}
            className={`w-full px-3 py-2 border rounded-md ${error ? "border-red-500" : "border-gray-300"}`}
            {...props}
          >
            {opciones?.map((opcion) => (
              <option key={opcion.value} value={opcion.value}>
                {opcion.label}
              </option>
            ))}
          </select>
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      );
    
    case "checkbox":
      return (
        <div className={`flex items-center mb-4 ${className}`}>
          <input
            type="checkbox"
            checked={value === 1}
            onChange={onChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            {...props}
          />
          <label className="ml-2 text-sm font-medium text-gray-700 dark:text-white">{label}</label>
        </div>
      );
    
    case "radio":
      return (
        <div className={`mb-4 ${className}`}>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">{label}</label>
          <div className="flex space-x-4">
            {opciones?.map((opcion) => (
              <div key={opcion.value} className="flex items-center">
                <input
                  type="radio"
                  id={`${label}-${opcion.value}`}
                  name={label}
                  value={opcion.value}
                  checked={value == opcion.value}
                  onChange={() => onChange(opcion.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  {...props}
                />
                <label
                  htmlFor={`${label}-${opcion.value}`}
                  className="ml-2 text-sm font-medium text-gray-700 dark:text-white"
                >
                  {opcion.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      );
    
    default:
      return null;
  }
};

// Valor inicial para una nueva consulta
const consultaInicial = {
  producto: "",
  carga: 2,
  modo: "Camión",
  toneladas: 10,
  importacion: 1,
  comuna: "",
  puerto: "",
  pais: "",
  cargapeligrosa: 0
};

const Dashboard = () => {
  const [consultas, setConsultas] = useState([{ ...consultaInicial }]);
  const [resultados, setResultados] = useState([]);
  const [errores, setErrores] = useState([{}]);
  const [cargando, setCargando] = useState(false);

  // Función unificada para manejar cambios en todos los tipos de campos
  const handleChange = (index, campo, valor, esTipoCheckbox = false) => {
    const nuevasConsultas = [...consultas];
    
    if (esTipoCheckbox) {
      nuevasConsultas[index][campo] = nuevasConsultas[index][campo] === 0 ? 1 : 0;
    } else {
      nuevasConsultas[index][campo] = valor;
    }
    
    setConsultas(nuevasConsultas);
    
    // Limpiar error si se ha resuelto
    if (errores[index]?.[campo]) {
      const nuevosErrores = [...errores];
      nuevosErrores[index] = { ...nuevosErrores[index] };
      delete nuevosErrores[index][campo];
      setErrores(nuevosErrores);
    }
  };

  // Agrega una nueva consulta
  const agregarConsulta = () => {
    setConsultas([...consultas, { ...consultaInicial }]);
    setErrores([...errores, {}]);
  };

  // Elimina una consulta
  const eliminarConsulta = (index) => {
    if (consultas.length === 1) return; // Mantener al menos una consulta
    
    const nuevasConsultas = consultas.filter((_, i) => i !== index);
    const nuevosErrores = errores.filter((_, i) => i !== index);
    
    setConsultas(nuevasConsultas);
    setErrores(nuevosErrores);
  };

  // Validación simple del formulario
  const validarFormulario = () => {
    const nuevosErrores = consultas.map(consulta => {
      const erroresConsulta = {};
      
      // Validar campos obligatorios
      if (!consulta.producto) {
        erroresConsulta.producto = "Campo obligatorio";
      }
      
      if (!consulta.comuna && consulta.comuna !== 0) {
        erroresConsulta.comuna = "Campo obligatorio";
      }
      
      if (consulta.toneladas <= 0) {
        erroresConsulta.toneladas = "Debe ser mayor a 0";
      }
      
      return erroresConsulta;
    });
    
    setErrores(nuevosErrores);
    return nuevosErrores.every(e => Object.keys(e).length === 0);
  };

  // Mostrar notificación (toast)
  const mostrarNotificacion = (mensaje, tipo) => {
    const notificacion = document.createElement("div");
    notificacion.className = `fixed bottom-4 right-4 p-4 rounded-md shadow-lg ${
      tipo === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
    } flex items-center space-x-2 max-w-sm z-50`;
    
    const icono = document.createElement("div");
    icono.innerHTML = tipo === "success" 
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    
    const texto = document.createElement("p");
    texto.textContent = mensaje;
    
    notificacion.appendChild(icono);
    notificacion.appendChild(texto);
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
      notificacion.style.opacity = "0";
      notificacion.style.transition = "opacity 0.5s";
      setTimeout(() => document.body.removeChild(notificacion), 500);
    }, 3000);
  };

  // Envío del formulario
  const enviarConsultas = async () => {
    if (!validarFormulario()) {
      mostrarNotificacion("Por favor, corrija los errores en el formulario", "error");
      return;
    }
    
    setCargando(true);
    
    try {
      // Simulamos la respuesta para la demostración
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const resultadosSimulados = consultas.map((c, i) => ({
        id: i + 1,
        ...c,
        fecha: new Date().toISOString(),
        resultado: `Resultado para producto ${c.producto} (${c.toneladas} ton)`
      }));
      
      setResultados(resultadosSimulados);
      mostrarNotificacion("Consulta realizada exitosamente", "success");
    } catch (error) {
      console.error("Error al enviar consultas:", error);
      mostrarNotificacion("Error al realizar la consulta", "error");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0 dark:text-white">Formulario de Consultas</h2>
        <button
          onClick={agregarConsulta}
          className=" flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-3xl hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Agregar consulta
        </button>
      </div>

      {consultas.map((consulta, index) => (
        <div 
          key={index} 
          className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 mb-6 dark:bg-slate-800 dark:border-slate-700"
        >
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center dark:bg-slate-700 dark:border-slate-600">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">
              Consulta #{index + 1}
            </h3>
            {consultas.length > 1 && (
              <button
                onClick={() => eliminarConsulta(index)}
                className="flex items-center text-sm text-red-600 hover:text-red-800 focus:outline-none"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Eliminar
              </button>
            )}
          </div>
          
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 dark:bg-slate-800 dark:border-slate-700">
              {Object.entries(CAMPOS_CONFIG).map(([campo, config]) => (
                <FormField
                  key={`${index}-${campo}`}
                  tipo={config.tipo}
                  label={config.label}
                  value={consulta[campo]}
                  onChange={(config.tipo === "checkbox") 
                    ? () => handleChange(index, campo, null, true)
                    : (config.tipo === "radio")
                      ? (valor) => handleChange(index, campo, valor)
                      : (e) => handleChange(index, campo, e.target.value)
                  }
                  error={errores[index]?.[campo]}
                  opciones={config.opciones}
                  placeholder={config.placeholder}
                  required={config.required}
                  min={config.min}
                  className={config.tipo === "radio" ? "col-span-full" : ""}
                />
              ))}
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-center mb-8">
        <button
          onClick={enviarConsultas}
          disabled={cargando}
          className={`flex items-center px-6 py-3 text-lg font-medium rounded-3xl text-white ${
            cargando ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        >
          {cargando ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Search className="w-5 h-5 mr-2" />
              Consultar
            </>
          )}
        </button>
      </div>

      {resultados.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 dark:bg-slate-700 dark:border-slate-700">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">Resultados</h3>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 ">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-white">ID</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-white">Producto</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-white">Operación</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-white">Toneladas</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-white">Resultado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {resultados.map((resultado) => (
                  <tr key={resultado.id}>
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{resultado.id}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{resultado.producto}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                      {resultado.importacion === 1 ? "Importación" : "Exportación"}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{resultado.toneladas}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-blue-600">{resultado.resultado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;