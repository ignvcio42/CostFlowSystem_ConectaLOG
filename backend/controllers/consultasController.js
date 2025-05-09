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

        let consultaId;

        if (consultaExistente.rows.length > 0) {
            // Ya existe → registrar como histórica
            consultaId = consultaExistente.rows[0].id;
        } else {
            // No existe → llamar API externa
            const { data } = await axios.get("http://localhost:8000/query", { params: parametros });

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
                    data
                ]
            );

            consultaId = insert.rows[0].id;
        }

        // Insertar en tabla histórica
        await pool.query(
            "INSERT INTO tbl_consulta_historica (user_id, consulta_id) VALUES ($1, $2)",
            [userId, consultaId]
        );

        // Devolver resultado
        const finalResponse = consultaExistente.rows[0]?.respuesta_json || (await pool.query(
            "SELECT respuesta_json FROM tbl_consulta_unica WHERE id = $1",
            [consultaId]
        )).rows[0].respuesta_json;

        return res.json(finalResponse);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al procesar la consulta." });
    }
};
