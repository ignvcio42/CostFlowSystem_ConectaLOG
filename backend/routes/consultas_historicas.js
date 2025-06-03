import express from "express";
import { obtenerHistorial, obtenerHistorialDeUsuario, realizarConsulta, reejecutarConsulta } from "../controllers/consultasController.js";
import authMiddleware, { isAdmin } from "../middleware/authMiddleware.js";


const router = express.Router();

router.post("/consultar", authMiddleware, realizarConsulta);
router.get("/historial", authMiddleware, obtenerHistorial);
router.post("/reejecutar-consulta", authMiddleware, reejecutarConsulta);

// Por seguridad, pon un middleware que solo deje pasar a admin
router.get("/admin/historial/:userId", authMiddleware, isAdmin, obtenerHistorialDeUsuario);


export default router;
