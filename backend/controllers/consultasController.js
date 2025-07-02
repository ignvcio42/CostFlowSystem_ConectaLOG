import { pool } from "../libs/database.js";
import axios from "axios";
import { generarHashConsulta } from "../libs/hash.js";
import { sendUserQuerySummary } from "../libs/mail.js";

const API_URL = "http://localhost:8000/query";

export const realizarConsulta = async (req, res) => {
  const userId = req.user.userId;
  const parametros = req.body;
  const isArray = Array.isArray(parametros);
  const queries = isArray ? parametros : [parametros];
  const resultados = [];

  try {
    // 0. Obtener validez preferida del usuario
    const { rows: userRows } = await pool.query(
      "SELECT validez_preferida FROM tbluser WHERE id = $1",
      [userId]
    );
    const meses = userRows[0]?.validez_preferida ?? 2;
    const periodo_validez = `${meses} months`;

    for (const query of queries) {
      const hash = generarHashConsulta(query);

      // 1. Buscar si ya existe la consulta única
      const consultaExistente = await pool.query(
        "SELECT * FROM tbl_consulta_unica WHERE hash_request = $1",
        [hash]
      );

      let data;
      let consultaId = null;

      if (consultaExistente.rows.length > 0) {
        // 2. Ya existe consulta única, usar su ID
        const consulta = consultaExistente.rows[0];
        consultaId = consulta.id;

        // 3. Verificar si hay una entrada vigente en consulta_historica
        const { rows: historialRows } = await pool.query(
          `
          SELECT fecha_valida_hasta
          FROM tbl_consulta_historica
          WHERE user_id = $1 AND consulta_id = $2
          ORDER BY fecha_consulta DESC
          LIMIT 1
        `,
          [userId, consultaId]
        );

        const hoy = new Date();
        const sigueVigente =
          historialRows.length > 0 &&
          new Date(historialRows[0].fecha_valida_hasta) > hoy;

        if (sigueVigente) {
          // 🔁 Aunque esté vigente, respondemos desde BD...
          data = consulta.respuesta_json;
        } else {
          // 🔁 Si está expirada, consultamos la API
          try {
            const response = await axios.get(API_URL, { params: query });
            data = response.data;

            if (data && data.error) {
              resultados.push({
                error: "Consulta inválida: " + data.error,
                code: "QUERY_INVALID",
              });
              continue;
            }

            // Opcional: podrías actualizar la respuesta antigua si quieres, pero no es necesario.
          } catch (apiError) {
            resultados.push({
              error: "La API externa no está disponible.",
              code: "API_DOWN",
            });
            continue;
          }
        }
      } else {
        // 4. No existe consulta única → consultar API y guardar
        try {
          const response = await axios.get(API_URL, { params: query });
          data = response.data;

          if (data && data.error) {
            resultados.push({
              error: "Consulta inválida: " + data.error,
              code: "QUERY_INVALID",
            });
            continue;
          }
        } catch (apiError) {
          resultados.push({
            error: "La API externa no está disponible.",
            code: "API_DOWN",
          });
          continue;
        }

        // 5. Insertar nueva consulta única
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
        consultaId = insert.rows[0].id;
      }

      // 6. Registrar en consulta_historica SIEMPRE (vigente o no)
      const fechaConsulta = new Date();
      const fechaValidaHasta = new Date(fechaConsulta);
      fechaValidaHasta.setMonth(fechaValidaHasta.getMonth() + meses);

      await pool.query(
        `
        INSERT INTO tbl_consulta_historica (
          user_id, consulta_id, fecha_consulta, periodo_validez, fecha_valida_hasta
        ) VALUES ($1, $2, $3, $4, $5)
      `,
        [userId, consultaId, fechaConsulta, periodo_validez, fechaValidaHasta]
      );

      resultados.push(data);
    }

    // 7. Enviar respuesta al frontend
    res.json(isArray ? resultados : resultados[0]);

    // 8. Enviar resumen por correo (no bloquear)
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
        if (!userEmail) return;

        await sendUserQuerySummary(userEmail, resultados);
      } catch (err) {
        console.error("Error al enviar correo resumen consulta:", err);
      }
    }, 0);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al procesar la consulta.",
      code: "INTERNAL_ERROR",
    });
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
  ch.fecha_valida_hasta,
  ch.periodo_validez,
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
  const userId = req.user.userId;
  const parametros = req.body;
  const hash = generarHashConsulta(parametros);

  try {
    // 1. Consultar la API externa
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
      // 2A. Ya existe, no la sobrescribimos, solo usamos el ID
      consultaId = consultaExistente.rows[0].id;
    } else {
      // 2B. No existe, insertamos una nueva
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

    // 3. Obtener validez preferida del usuario
    const { rows: configRows } = await pool.query(
      "SELECT validez_preferida FROM tbluser WHERE id = $1",
      [userId]
    );
    const meses = configRows[0]?.validez_preferida ?? 2;
    const periodo_validez = `${meses} months`;

    // 4. Calcular fecha de validez
    const fechaConsulta = new Date();
    const fechaValidaHasta = new Date(fechaConsulta);
    fechaValidaHasta.setMonth(fechaValidaHasta.getMonth() + meses);

    // 5. Registrar en historial con validez personalizada
    await pool.query(
      `INSERT INTO tbl_consulta_historica (
        user_id, consulta_id, fecha_consulta, periodo_validez, fecha_valida_hasta
      ) VALUES ($1, $2, $3, $4, $5)`,
      [userId, consultaId, fechaConsulta, periodo_validez, fechaValidaHasta]
    );

    // 6. Devolver respuesta de API
    res.json(data);
  } catch (error) {
    console.error("Error al re-ejecutar la consulta:", error);
    res.status(500).json({ message: "Error al re-ejecutar la consulta." });
  }
};

export const obtenerHistorialDeUsuario = async (req, res) => {
  const userId = req.params.userId;
  try {
    const { rows } = await pool.query(
      `SELECT 
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
      ORDER BY ch.fecha_consulta DESC`,
      [userId]
    );
    res.json(rows); // <-- Array plano
  } catch (error) {
    res.status(500).json({ error: "Error al obtener historial de consultas" });
  }
};
