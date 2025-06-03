// src/components/HistorialFilter.jsx
import React, { useState } from "react";

const HistorialFilter = ({
  filters,
  setFilters,
  capituloOptions,
  productoOptions,
}) => {
  return (
    <div className="bg-white  rounded-2xl shadow-lg p-6 mb-6 flex flex-wrap gap-4 dark:bg-black/20 transition-colors">
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-white">
          Fecha
        </label>
        <input
          type="date"
          value={filters.fecha}
          onChange={(e) => setFilters({ ...filters, fecha: e.target.value })}
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-white">
          Origen
        </label>
        <input
          type="text"
          placeholder="Origen"
          value={filters.origen}
          onChange={(e) => setFilters({ ...filters, origen: e.target.value })}
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-white">
          Destino
        </label>
        <input
          type="text"
          placeholder="Destino"
          value={filters.destino}
          onChange={(e) => setFilters({ ...filters, destino: e.target.value })}
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-white">
          Capítulo
        </label>
        <input
          type="text"
          placeholder="Capítulo"
          value={filters.capitulo}
          onChange={(e) => setFilters({ ...filters, capitulo: e.target.value })}
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-white">
          Producto
        </label>
        <input
          type="text"
          placeholder="Producto"
          value={filters.producto}
          onChange={(e) => setFilters({ ...filters, producto: e.target.value })}
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <button
        className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300 mt-5"
        onClick={() =>
          setFilters({
            fecha: "",
            origen: "",
            destino: "",
            capitulo: "",
            producto: "",
          })
        }
      >
        Limpiar
      </button>
    </div>
  );
};

export default HistorialFilter;
