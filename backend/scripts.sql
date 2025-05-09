-- cambiar estado con otra tabla
CREATE TABLE tbluser (
    id SERIAL PRIMARY KEY,
    email VARCHAR(120) UNIQUE NOT NULL,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50),
    contact VARCHAR(15),
    password TEXT,
    role VARCHAR(10) NOT NULL DEFAULT 'user',
	estado BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tbl_user_estado_historial (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES tbluser(id) ON DELETE CASCADE,
    cambiado_por INTEGER NOT NULL REFERENCES tbluser(id) ON DELETE SET NULL,
    nuevo_estado BOOLEAN NOT NULL,
    fecha_cambio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    comentario TEXT
);

CREATE TABLE tbl_consulta_unica (
    id SERIAL PRIMARY KEY,
    hash_request VARCHAR(64) UNIQUE NOT NULL,
    fecha_consulta TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Parámetros de entrada
    producto VARCHAR(50),
    carga INTEGER,
    modo VARCHAR(50),
    toneladas NUMERIC,
    importacion INTEGER,
    comuna INTEGER,
    puerto INTEGER,
    puerto_ext INTEGER,
    pais INTEGER,
    cargapeligrosa INTEGER,

    -- Respuesta completa
    respuesta_json JSONB NOT NULL,
    fuente_respuesta VARCHAR(20)
);
-- 🧠 Guarda las consultas únicas, junto con los parámetros, para evitar redundancia.


CREATE TABLE tbl_consulta_historica (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES tbluser(id) ON DELETE CASCADE,
    consulta_id INTEGER REFERENCES tbl_consulta_unica(id) ON DELETE CASCADE,
    fecha_consulta TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 👥 Esta tabla relaciona al usuario con la consulta, y permite múltiples usuarios para una misma consulta.
-- Si un usuario se elimina, solo su historial se borra, no la consulta única (a menos que no esté asociada a nadie).

--  Índices Recomendados
CREATE INDEX idx_consulta_user ON tbl_consulta_historica(user_id);
CREATE INDEX idx_consulta_unica_hash ON tbl_consulta_unica(hash_request);
