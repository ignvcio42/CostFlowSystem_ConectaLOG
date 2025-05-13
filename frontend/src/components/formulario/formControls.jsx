import React from "react";

const FormControls = ({ addQuery, handleSubmit, cargando, clearAll, queriesCount }) => (
  <div className="flex flex-wrap gap-4 mb-4 justify-between items-center">
    <div className="flex gap-3">
      <button
        type="button"
        onClick={addQuery}
        className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-100 dark:hover:bg-indigo-800 transition-colors flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Agregar Consulta
      </button>
      
      <button
        type="button"
        onClick={clearAll}
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        Limpiar Todo
      </button>
    </div>
    
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {queriesCount} consulta{queriesCount !== 1 ? 's' : ''}
      </span>
      <button
        type="submit"
        disabled={cargando}
        className={`px-6 py-2 rounded-lg text-white flex items-center gap-2 transition-colors ${cargando ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {cargando ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Procesando...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </svg>
            Enviar Consultas
          </>
        )}
      </button>
    </div>
  </div>
);

export default FormControls;