import { pool } from "../libs/database.js";
import axios from "axios";
import { generarHashConsulta } from "../libs/hash.js";
import { sendUserQuerySummary } from "../libs/mail.js";

export const realizarConsulta = async (req, res) => {
  const userId = req.user.userId;
  const parametros = req.body;

  const isArray = Array.isArray(parametros);
  const queries = isArray ? parametros : [parametros];

  let resultados = [];

  try {
    for (const query of queries) {
      const hash = generarHashConsulta(query);

      // Verificar si ya existe la consulta
      const consultaExistente = await pool.query(
        "SELECT * FROM tbl_consulta_unica WHERE hash_request = $1",
        [hash]
      );

      if (consultaExistente.rows.length > 0) {
        const consultaId = consultaExistente.rows[0].id;
        await pool.query(
          "INSERT INTO tbl_consulta_historica (user_id, consulta_id) VALUES ($1, $2)",
          [userId, consultaId]
        );
        resultados.push(consultaExistente.rows[0].respuesta_json);
        continue;
      }

      // Si no existe → intentar llamar API externa
      let data;
      try {
        const response = await axios.get("http://localhost:8000/query", {
          params: query,
        });
        data = response.data;
      } catch (apiError) {
        resultados.push({
          error: "La API externa no está disponible para una de las consultas.",
        });
        continue;
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
          query.producto,
          query.carga,
          query.modo,
          query.toneladas,
          query.importacion,
          query.comuna,
          query.puerto,
          query.puerto_ext,
          query.pais,
          query.cargapeligrosa,
          data,
        ]
      );

      const consultaId = insert.rows[0].id;
      await pool.query(
        "INSERT INTO tbl_consulta_historica (user_id, consulta_id) VALUES ($1, $2)",
        [userId, consultaId]
      );
      resultados.push(data);
    }

    // Devolver los resultados (uno o varios)
    res.json(isArray ? resultados : resultados[0]);

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    // ENVÍA EL CORREO SOLO UNA VEZ CON TODAS LAS CONSULTAS
    setTimeout(async () => {
      try {
        let userEmail = req.user?.email;
        if (!userEmail) {
          const { rows } = await pool.query(
            "SELECT email FROM tbluser WHERE id = $1",
            [userId]
          );
          userEmail = rows[0]?.email;
        }
        if (!userEmail) {
          console.error(
            "No se pudo encontrar el email del usuario, no se envía correo."
          );
          return;
        }

        // AHORA MANDAS LOS RESULTADOS (RESPUESTA) Y NO LOS QUERIES (PARÁMETROS)
        await sendUserQuerySummary(userEmail, resultados);
      } catch (err) {
        console.error("Error al enviar correo resumen consulta:", err);
      }
    }, 0);

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
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
        ch.id AS historial_id,
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

export const reejecutarConsulta = async (req, res) => {
  const userId = req.user.userId; // Asegúrate de tener autenticación en la ruta
  const parametros = req.body;
  const hash = generarHashConsulta(parametros);

  try {
    // 1. Consulta SIEMPRE la API externa (no importa si existe en BD)
    let data;
    try {
      const response = await axios.get("http://localhost:8000/query", {
        params: parametros,
      });
      data = response.data;
    } catch (apiError) {
      return res.status(503).json({
        message: "La API externa no está disponible.",
      });
    }

    // 2. Buscar si ya existe una consulta única
    const consultaExistente = await pool.query(
      "SELECT id FROM tbl_consulta_unica WHERE hash_request = $1",
      [hash]
    );

    let consultaId;
    if (consultaExistente.rows.length > 0) {
      // 3A. Si existe, ACTUALIZAR respuesta_json y fecha
      consultaId = consultaExistente.rows[0].id;
      await pool.query(
        `UPDATE tbl_consulta_unica
         SET respuesta_json = $1, fuente_respuesta = 'api_externa', fecha_consulta = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [data, consultaId]
      );
    } else {
      // 3B. Si no existe, INSERTAR nuevo registro
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
      consultaId = insert.rows[0].id;
    }

    // 4. Registra el uso en el historial
    await pool.query(
      "INSERT INTO tbl_consulta_historica (user_id, consulta_id) VALUES ($1, $2)",
      [userId, consultaId]
    );

    // 5. Devuelve la respuesta de la API
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al re-ejecutar la consulta." });
  }
};
