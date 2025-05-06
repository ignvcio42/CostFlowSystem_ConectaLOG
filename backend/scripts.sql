CREATE TABLE tbluser (
	id SERIAL NOT NULL PRIMARY KEY,
	email VARCHAR(120) UNIQUE NOT NULL,
	firstName VARCHAR(50) NOT NULL,
	lastName VARCHAR(50),
	contact VARCHAR(15),
	accounts TEXT[],
	password TEXT,
	provider VARCHAR(10) NULL,
	country TEXT,
	currency VARCHAR(5) NOT NULL DEFAULT 'USD',
	createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE tbl_consulta_historica (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES tbluser(id) ON DELETE SET NULL,
    fecha_consulta TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    producto_api VARCHAR(50),
    carga_api INTEGER,
    modo_api VARCHAR(50),
    toneladas_api NUMERIC,
    importacion_api INTEGER,
    comuna_api INTEGER,
    puerto_api INTEGER,
    puerto_ext_api INTEGER,
    pais_api INTEGER,
    cargapeligrosa_api INTEGER,
    hash_request VARCHAR(64) UNIQUE NOT NULL, -- Hash SHA256 de los parámetros de entrada ordenados
    respuesta_json JSONB NOT NULL,          -- Respuesta completa de la API externa
    fuente_respuesta VARCHAR(20)             -- 'api_externa' o 'cache_local'
);
CREATE INDEX idx_consulta_historica_hash ON tbl_consulta_historica (hash_request);
CREATE INDEX idx_consulta_historica_user_id ON tbl_consulta_historica (user_id);

------
1. tbluser — Tabla de usuarios
sql
Copiar
Editar
CREATE TABLE tbluser (
	id SERIAL PRIMARY KEY,
	email VARCHAR(120) UNIQUE NOT NULL,
	firstName VARCHAR(50) NOT NULL,
	lastName VARCHAR(50),
	contact VARCHAR(15),
	accounts TEXT[],
	password TEXT,
	provider VARCHAR(10),
	country TEXT,
	currency VARCHAR(5) NOT NULL DEFAULT 'USD',
	role TEXT NOT NULL DEFAULT 'usuario',
	createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT chk_user_role CHECK (role IN ('admin', 'usuario'))
);

2. tbl_consulta_unica — Tabla de consultas únicas
sql
Copiar
Editar
CREATE TABLE tbl_consulta_unica (
	id SERIAL PRIMARY KEY,
	hash_request VARCHAR(64) UNIQUE NOT NULL,
	fecha_consulta TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	producto_api VARCHAR(50),
	carga_api INTEGER,
	modo_api VARCHAR(50),
	toneladas_api NUMERIC,
	importacion_api INTEGER,
	comuna_api INTEGER,
	puerto_api INTEGER,
	puerto_ext_api INTEGER,
	pais_api INTEGER,
	cargapeligrosa_api INTEGER,
	respuesta_json JSONB NOT NULL,
	fuente_respuesta VARCHAR(20)
);

3. tbl_consulta_historica — Historial por usuario
sql
Copiar
Editar
CREATE TABLE tbl_consulta_historica (
	id SERIAL PRIMARY KEY,
	user_id INTEGER REFERENCES tbluser(id) ON DELETE CASCADE,
	consulta_id INTEGER REFERENCES tbl_consulta_unica(id) ON DELETE CASCADE,
	fecha_consulta TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

Índices sugeridos (opcional pero recomendado):
sql
Copiar
Editar
-- Para búsquedas más rápidas
CREATE INDEX idx_consulta_user ON tbl_consulta_historica(user_id);
CREATE INDEX idx_consulta_unica_hash ON tbl_consulta_unica(hash_request);