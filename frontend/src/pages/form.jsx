import React, { useState } from "react";
import { 
  Check, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Search, 
  Loader2 
} from "lucide-react";

// Definición de campos y sus tipos para mejor manejo
const CAMPOS_CONFIG = {
  producto: { 
    tipo: "texto", 
    label: "Código Producto", 
    placeholder: "Ej: 08104019",
    required: true,
    descripcion: "Código arancelario del producto"
  },
  carga: { 
    tipo: "select", 
    label: "Tipo de Carga", 
    opciones: [
      { value: 1, label: "Granel Liquido" },
      { value: 2, label: "Carga General" },
      { value: 3, label: "Granel Solido" },
      { value: 4, label: "Carga Container Reefer" },
      { value: 5, label: "Carga Container Dry" }
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
    min: 1, 
    placeholder: "Cantidad" 
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
    tipo: "numero", 
    label: "Código Comuna", 
    placeholder: "Ej: 7101",
    required: true,
    descripcion: "Código único de la comuna" 
  },
  puerto: { 
    tipo: "numero", 
    label: "Código Puerto", 
    placeholder: "Ej: 906",
    descripcion: "Código del puerto de embarque/desembarque" 
  },
  puerto_ext: { 
    tipo: "texto", 
    label: "Puerto extranjero (opcional)", 
    placeholder: "0",
    defaultValue: "0",
    descripcion: "Ingrese 0 para puerto nacional, 1 para extranjero"
  },
  pais: { 
    tipo: "numero", 
    label: "Código País", 
    placeholder: "Ej: 225",
    descripcion: "Código del país de origen/destino" 
  },
  cargapeligrosa: { 
    tipo: "checkbox", 
    label: "Es carga peligrosa" 
  }
};

// Componente de Input personalizado
const FormInput = ({ 
  label, 
  tipo, 
  value, 
  onChange, 
  error, 
  className = "", 
  ...props 
}) => {
  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      <label className="text-sm font-medium text-gray-700">
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>
      {tipo === "texto" && (
        <input
          type="text"
          value={value}
          onChange={onChange}
          className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          {...props}
        />
      )}
      {tipo === "numero" && (
        <input
          type="number"
          value={value}
          onChange={onChange}
          className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          {...props}
        />
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// Componente de Select personalizado
const FormSelect = ({ 
  label, 
  value, 
  onChange, 
  opciones = [], 
  error, 
  className = "",
  ...props 
}) => {
  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      <label className="text-sm font-medium text-gray-700">
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={onChange}
        className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        {...props}
      >
        {opciones.map((opcion) => (
          <option key={opcion.value} value={opcion.value}>
            {opcion.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// Componente Checkbox personalizado
const FormCheckbox = ({ 
  label, 
  checked, 
  onChange, 
  className = "", 
  ...props 
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        {...props}
      />
      <label className="text-sm font-medium text-gray-700">{label}</label>
    </div>
  );
};

// Componente Radio personalizado
const FormRadioGroup = ({ 
  label, 
  value, 
  onChange, 
  opciones = [], 
  className = "", 
  ...props 
}) => {
  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex space-x-4">
        {opciones.map((opcion) => (
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
              className="ml-2 text-sm font-medium text-gray-700"
            >
              {opcion.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
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
  puerto_ext: "0",
  pais: "",
  cargapeligrosa: 0
};

const Dashboard = () => {
  const [consultas, setConsultas] = useState([{ ...consultaInicial }]);
  const [resultados, setResultados] = useState([]);
  const [errores, setErrores] = useState([{}]);
  const [cargando, setCargando] = useState(false);
  const [formEnviado, setFormEnviado] = useState(false);

  // Maneja cambios en campos de texto y número
  const handleChange = (index, campo, valor) => {
    const nuevasConsultas = [...consultas];
    nuevasConsultas[index][campo] = valor;
    setConsultas(nuevasConsultas);
    
    // Limpiar error si se ha resuelto
    if (errores[index]?.[campo]) {
      const nuevosErrores = [...errores];
      nuevosErrores[index] = { ...nuevosErrores[index] };
      delete nuevosErrores[index][campo];
      setErrores(nuevosErrores);
    }
  };

  // Maneja cambios en checkboxes (usando 0/1 en lugar de booleanos)
  const handleCheckboxChange = (index, campo) => {
    const nuevasConsultas = [...consultas];
    nuevasConsultas[index][campo] = nuevasConsultas[index][campo] === 0 ? 1 : 0;
    setConsultas(nuevasConsultas);
  };

  // Agrega una nueva consulta
  const agregarConsulta = () => {
    setConsultas([...consultas, { ...consultaInicial }]);
    setErrores([...errores, {}]);
  };

  // Elimina una consulta
  const eliminarConsulta = (index) => {
    if (consultas.length === 1) {
      return; // Mantener al menos una consulta
    }
    
    const nuevasConsultas = consultas.filter((_, i) => i !== index);
    const nuevosErrores = errores.filter((_, i) => i !== index);
    
    setConsultas(nuevasConsultas);
    setErrores(nuevosErrores);
  };

  // Validación del formulario
  const validarFormulario = () => {
    const nuevosErrores = consultas.map(consulta => {
      const erroresConsulta = {};
      
      // Validar campos obligatorios
      if (!consulta.producto) {
        erroresConsulta.producto = "El código de producto es obligatorio";
      }
      
      if (!consulta.comuna && consulta.comuna !== 0) {
        erroresConsulta.comuna = "El código de comuna es obligatorio";
      }
      
      if (consulta.toneladas <= 0) {
        erroresConsulta.toneladas = "Debe ser mayor a 0";
      }
      
      // Validar lógica de negocio específica
      if (consulta.puerto_ext === "1" && !consulta.pais && consulta.pais !== 0) {
        erroresConsulta.pais = "El código de país es requerido para puertos extranjeros";
      }
      
      return erroresConsulta;
    });
    
    setErrores(nuevosErrores);
    
    // Retorna true si no hay errores
    return nuevosErrores.every(e => Object.keys(e).length === 0);
  };

  // Envío del formulario
  const enviarConsultas = async () => {
    if (!validarFormulario()) {
      // Mostrar notificación de error
      mostrarNotificacion("Por favor, corrija los errores en el formulario", "error");
      return;
    }
    
    setCargando(true);
    setFormEnviado(true);
    
    try {
      // Formatear datos según lo esperado por la API
      const consultasFormateadas = consultas.map(c => ({
        ...c,
        // Asegurar que los valores numéricos se envíen como números
        carga: parseInt(c.carga) || 0,
        toneladas: parseInt(c.toneladas) || 0,
        importacion: parseInt(c.importacion) || 0,
        comuna: c.comuna === "" ? "" : parseInt(c.comuna) || 0,
        puerto: c.puerto === "" ? "" : parseInt(c.puerto) || 0,
        puerto_ext: parseInt(c.puerto_ext) || 0,
        pais: c.pais === "" ? "" : parseInt(c.pais) || 0,
        cargapeligrosa: parseInt(c.cargapeligrosa) || 0
      }));
      
      // Aquí va la llamada a la API real
      try {
        // Uncomment para usar en producción:
        // const res = await axios.post("/api/consultas_historicas", { consultas: consultasFormateadas });
        
        // Simulamos la respuesta para la demostración
        await new Promise(resolve => setTimeout(resolve, 1500));
        const resultadosSimulados = consultasFormateadas.map((c, i) => ({
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
      }
    } catch (error) {
      console.error("Error al enviar consultas:", error);
      mostrarNotificacion("Error al realizar la consulta", "error");
    } finally {
      setCargando(false);
    }
  };

  // Función para mostrar notificaciones (simula toast)
  const mostrarNotificacion = (mensaje, tipo) => {
    const notificacion = document.createElement("div");
    notificacion.className = `fixed bottom-4 right-4 p-4 rounded-md shadow-lg ${
      tipo === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
    } flex items-center space-x-2 max-w-sm`;
    
    const icono = document.createElement("div");
    icono.className = "flex-shrink-0";
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

  // Renderizar campo según su tipo
  const renderizarCampo = (campo, config, consulta, index) => {
    const error = errores[index]?.[campo] || "";
    
    switch (config.tipo) {
      case "texto":
        return (
          <div className="col-span-1">
            <FormInput
              key={campo}
              label={config.label}
              tipo={config.tipo}
              value={consulta[campo]}
              onChange={(e) => handleChange(index, campo, e.target.value)}
              placeholder={config.placeholder || ""}
              error={error}
              required={config.required}
            />
            {config.descripcion && (
              <p className="text-xs text-gray-500 mt-1">{config.descripcion}</p>
            )}
          </div>
        );
      
      case "numero":
        return (
          <div className="col-span-1">
            <FormInput
              key={campo}
              label={config.label}
              tipo={config.tipo}
              value={consulta[campo]}
              onChange={(e) => handleChange(index, campo, e.target.value === "" ? "" : parseInt(e.target.value) || 0)}
              min={config.min}
              placeholder={config.placeholder || ""}
              error={error}
            />
            {config.descripcion && (
              <p className="text-xs text-gray-500 mt-1">{config.descripcion}</p>
            )}
          </div>
        );
      
      case "select":
        return (
          <div className="col-span-1">
            <FormSelect
              key={campo}
              label={config.label}
              value={consulta[campo]}
              onChange={(e) => handleChange(index, campo, e.target.value)}
              opciones={config.opciones}
              error={error}
            />
            {config.descripcion && (
              <p className="text-xs text-gray-500 mt-1">{config.descripcion}</p>
            )}
          </div>
        );
      
      case "checkbox":
        return (
          <FormCheckbox
            key={campo}
            label={config.label}
            checked={consulta[campo] === 1}
            onChange={() => handleCheckboxChange(index, campo)}
            className="col-span-1"
          />
        );
      
      case "radio":
        return (
          <FormRadioGroup
            key={campo}
            label={config.label}
            value={consulta[campo]}
            onChange={(value) => handleChange(index, campo, value)}
            opciones={config.opciones}
            className="col-span-2"
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Formulario de Consultas</h2>
        <button
          onClick={agregarConsulta}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Agregar consulta
        </button>
      </div>

      {consultas.map((consulta, index) => (
        <div 
          key={index} 
          className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
        >
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800">
              Consulta #{index + 1}
            </h3>
            {consultas.length > 1 && (
              <button
                onClick={() => eliminarConsulta(index)}
                className="inline-flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-800 focus:outline-none"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Eliminar
              </button>
            )}
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(CAMPOS_CONFIG).map(([campo, config]) => 
                renderizarCampo(campo, config, consulta, index)
              )}
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-center mt-8">
        <button
          onClick={enviarConsultas}
          disabled={cargando}
          className={`inline-flex items-center px-6 py-3 text-lg font-medium rounded-md text-white ${
            cargando ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
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
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 mt-8">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-800">Resultados</h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operación</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toneladas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resultado</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {resultados.map((resultado) => (
                    <tr key={resultado.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{resultado.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{resultado.producto}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {resultado.importacion === 1 ? "Importación" : "Exportación"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{resultado.toneladas}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{resultado.resultado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;