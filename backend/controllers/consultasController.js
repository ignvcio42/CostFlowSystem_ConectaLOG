import { pool } from "../libs/database.js";
import axios from "axios";
import { generarHashConsulta } from "../libs/hash.js";

export const realizarConsulta = async (req, res) => {
  const userId = req.user.userId;
  const parametros = req.body;

  const hash = generarHashConsulta(parametros);

  try {
    // Verificar si ya existe la consulta
    const consultaExistente = await pool.query(
      "SELECT * FROM tbl_consulta_unica WHERE hash_request = $1",
      [hash]
    );

    if (consultaExistente.rows.length > 0) {
      const consultaId = consultaExistente.rows[0].id;

      // Insertar en tabla histórica
      await pool.query(
        "INSERT INTO tbl_consulta_historica (user_id, consulta_id) VALUES ($1, $2)",
        [userId, consultaId]
      );

      // Devolver resultado directamente
      return res.json(consultaExistente.rows[0].respuesta_json);
    }

    // Si no existe → intentar llamar API externa
    let data;
    try {
      const response = await axios.get("http://localhost:8000/query", {
        params: parametros,
      });
      data = response.data;
    } catch (apiError) {
      // API caída → abortar
      return res.status(503).json({
        message:
          "La API externa no está disponible y no hay datos almacenados para esta consulta.",
      });
    }

    // Insertar en consulta única
    const insert = await pool.query(
      `INSERT INTO tbl_consulta_unica (
        hash_request, producto, carga, modo, toneladas, importacion,
        comuna, puerto, puerto_ext, pais, cargapeligrosa,
        respuesta_json, fuente_respuesta
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'api_externa'
      ) RETURNING id`,
      [
        hash,
        parametros.producto,
        parametros.carga,
        parametros.modo,
        parametros.toneladas,
        parametros.importacion,
        parametros.comuna,
        parametros.puerto,
        parametros.puerto_ext,
        parametros.pais,
        parametros.cargapeligrosa,
        data,
      ]
    );

    const consultaId = insert.rows[0].id;

    // Insertar en tabla histórica
    await pool.query(
      "INSERT INTO tbl_consulta_historica (user_id, consulta_id) VALUES ($1, $2)",
      [userId, consultaId]
    );

    // Devolver el resultado obtenido de la API
    return res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al procesar la consulta." });
  }
};


export const obtenerHistorial = async (req, res) => {
  const userId = req.user.userId;

  try {
    const { rows } = await pool.query(
      `
      SELECT 
        cu.id AS consulta_id,
        cu.hash_request,
        ch.fecha_consulta,
        cu.producto,
        cu.carga,
        cu.modo,
        cu.toneladas,
        cu.importacion,
        cu.comuna,
        cu.puerto,
        cu.puerto_ext,
        cu.pais,
        cu.cargapeligrosa,
        cu.respuesta_json,
        cu.fuente_respuesta
      FROM tbl_consulta_historica ch
      JOIN tbl_consulta_unica cu ON ch.consulta_id = cu.id
      WHERE ch.user_id = $1
      ORDER BY ch.fecha_consulta DESC
      `,
      [userId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).json({ error: "Error al obtener historial de consultas" });
  }
};

