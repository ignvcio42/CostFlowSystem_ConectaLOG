import express from "express";
import { obtenerHistorial, realizarConsulta } from "../controllers/consultasController.js";
import authMiddleware from "../middleware/authMiddleware.js";


const router = express.Router();

router.post("/consultar", authMiddleware, realizarConsulta);
router.get("/historial", authMiddleware, obtenerHistorial);

export default router;
