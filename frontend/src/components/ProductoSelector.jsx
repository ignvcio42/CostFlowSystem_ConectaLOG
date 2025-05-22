import React, { useState, useEffect } from "react";
import Select from "react-select";
import glosass from "../data/productos/glosa_producto.json";
import subpartidas from "../data/productos/subpartida.json";
import partidas from "../data/productos/partida.json";
import capitulos from "../data/productos/capitulo.json";
import { FixedSizeList as List } from "react-window";

const searchTypes = {
  capitulo: "Capítulo",
  partida: "Partida",
  subpartida: "Subpartida",
  glosa: "Glosa Producto",
  manual: "Manual",
};

const customFilter = (option, inputValue) => {
  const input = inputValue.toLowerCase();
  return (
    option.label.toLowerCase().includes(input) ||
    option.value.toLowerCase().includes(input)
  );
};

const formatOptionLabel = ({ value, label }, { context }) => {
  return context === "menu" ? (
    <div>
      <div className="font-semibold">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  ) : (
    <span>{value}</span>
  );
};

// Virtualized MenuList
const heightPerOption = 54;
const VirtualizedMenuList = (props) => {
  const { options, children, maxHeight, getValue } = props;
  const [value] = getValue();
  const initialOffset = value ? options.indexOf(value) * heightPerOption : 0;

  return (
    <List
      height={Math.min(maxHeight, options.length * heightPerOption)}
      itemCount={children.length}
      itemSize={heightPerOption}
      initialScrollOffset={initialOffset}
      width="100%"
    >
      {({ index, style }) => (
        <div
          style={{
            ...style,
            padding: "8px 12px",
            boxSizing: "border-box",
            background: children[index]?.props?.isFocused ? "#E0F2FE" : "white",
          }}
        >
          {children[index]}
        </div>
      )}
    </List>
  );
};
const ProductoSelector = ({ value, onChange }) => {
  const [searchType, setSearchType] = useState("capitulo");
  const [inputValue, setInputValue] = useState(value || "");

  // ⚡ useEffect para poner searchType en manual si hay valor externo (edición)
  useEffect(() => {
    if (value) {
      setSearchType("manual");
      setInputValue(value);
    }
  }, [value]);

  const handleSearchTypeChange = (type) => {
    setSearchType(type);
    if (type === "capitulo") {
      onChange(inputValue);
    } else if (type === "manual") {
      // Si el tipo es manual, poner el valor actual (por si estaba en otro)
      onChange(inputValue);
    } else {
      onChange("");
      setInputValue(""); // Limpiar campo si no es manual
    }
  };

  const getOptions = () => {
    switch (searchType) {
      case "glosa":
        return glosass;
      case "subpartida":
        return subpartidas;
      case "partida":
        return partidas;
      case "capitulo":
        return capitulos;
      default:
        return [];
    }
  };

  const handleSelectChange = (selected) => {
    const newValue = selected ? selected.value : "";
    setInputValue(newValue);
    onChange(newValue);
  };

  const handleManualChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {Object.entries(searchTypes).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => handleSearchTypeChange(key)}
            className={`px-2 py-1 text-xs rounded ${
              searchType === key
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {searchType === "manual" ? (
        <input
          type="text"
          value={inputValue}
          onChange={handleManualChange}
          className="w-full border px-3 py-1 rounded text-sm"
          required
        />
      ) : (
        <Select
          options={getOptions()}
          value={getOptions().find((opt) => opt.value === inputValue)}
          onChange={handleSelectChange}
          isClearable
          placeholder={`Buscar por ${searchTypes[searchType]}...`}
          className="text-sm"
          noOptionsMessage={() => "No hay opciones"}
          filterOption={customFilter}
          formatOptionLabel={formatOptionLabel}
          getOptionValue={(option) => option.value}
          components={{ MenuList: VirtualizedMenuList }} // <- aquí!
        />
      )}
    </div>
  );
};

export default ProductoSelector;
