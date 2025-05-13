import React from "react";
import Select from "react-select";
import comunasOptions from "../../data/comunas_opciones.json";
import paisesOptions from "../../data/paises_opciones.json";
import puertosOptions from "../../data/puertos_opciones.json";

// Función para formatear las opciones para React Select
const formatOptions = (data) => {
  return data.sort((a, b) => a.label.localeCompare(b.label));
};

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "white", // Fondo blanco en modo oscuro también
    color: "black",
    borderColor: state.isFocused ? "#3b82f6" : "#d1d5db", // azul-500 o gray-300
    boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : undefined,
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "black", // Texto negro
  }),
  input: (provided) => ({
    ...provided,
    color: "black",
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "white", // Fondo del menú
    color: "black",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#f3f4f6" : "white", // hover: gray-100
    color: "black",
  }),
};

const QueryForm = ({ index, query, handleChange, removeQuery, isOnly }) => {
  return (
    <div className="mb-6 border p-4 rounded-lg bg-gray-50 dark:bg-muted relative shadow-sm transition-all duration-200 hover:shadow-md">
      <h3 className="font-semibold mb-2 dark:text-white">
        Consulta #{index + 1}
      </h3>
      <button
        type="button"
        onClick={() => removeQuery(index)}
        className={`absolute top-2 right-2 ${
          isOnly
            ? "text-gray-400 cursor-not-allowed"
            : "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
        }`}
        disabled={isOnly}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {Object.entries(query).map(([key, value]) => {
        let inputField;

        switch (key) {
          case "comuna":
            inputField = (
              <Select
                name={key}
                value={{
                  value: value,
                  label:
                    comunasOptions.find((option) => option.value === value)
                      ?.label || value,
                }}
                onChange={(option) =>
                  handleChange(index, {
                    target: { name: key, value: option?.value },
                  })
                }
                options={formatOptions(comunasOptions)}
                placeholder="Buscar Comuna..."
                classNamePrefix="react-select"
                className="dark:bg-gray-700 dark:text-white"
                styles={customSelectStyles}
              />
            );
            break;
          case "puerto":
            inputField = (
              <Select
                name={key}
                value={{
                  value: value,
                  label:
                    puertosOptions.find((option) => option.value === value)
                      ?.label || value,
                }}
                onChange={(option) =>
                  handleChange(index, {
                    target: { name: key, value: option?.value },
                  })
                }
                options={formatOptions(puertosOptions)}
                placeholder="Buscar Puerto (Local)..."
                classNamePrefix="react-select"
                className="dark:bg-gray-700 dark:text-white"
                styles={customSelectStyles}
              />
            );
            break;
          //   case 'puerto_ext':
          //     inputField = (
          //       <Select
          //         name={key}
          //         value={{ value: value, label: puertosOptions.find(option => option.value === value)?.label || value }}
          //         onChange={(option) => handleChange(index, { target: { name: key, value: option?.value } })}
          //         options={formatOptions(puertosOptions)}
          //         placeholder="Buscar Puerto (Externo)..."
          //         classNamePrefix="react-select"
          //         className="dark:bg-gray-700 dark:text-white"
          //       />
          //     );
          //     break;
          case "pais":
            inputField = (
              <Select
                name={key}
                value={{
                  value: value,
                  label:
                    paisesOptions.find((option) => option.value === value)
                      ?.label || value,
                }}
                onChange={(option) =>
                  handleChange(index, {
                    target: { name: key, value: option?.value },
                  })
                }
                options={formatOptions(paisesOptions)}
                placeholder="Buscar País..."
                classNamePrefix="react-select"
                className="dark:bg-gray-700 dark:text-white"
                styles={customSelectStyles}
              />
            );
            break;
          default:
            inputField = (
              <input
                name={key}
                type={typeof value === "number" ? "number" : "text"}
                value={value}
                onChange={(e) => handleChange(index, e)}
                className="w-full border px-3 py-1 rounded dark:bg-gray-700 dark:text-white"
                required
              />
            );
        }

        return (
          <div key={key} className="mb-2">
            <label className="block text-sm font-medium dark:text-gray-300">
              {key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ")}
            </label>
            {inputField}
          </div>
        );
      })}
    </div>
  );
};

export default QueryForm;
