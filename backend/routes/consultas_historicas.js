import express from "express";
import { realizarConsulta } from "../controllers/consultasController.js";
import authMiddleware from "../middleware/authMiddleware.js";


const router = express.Router();

router.post("/consultar", authMiddleware, realizarConsulta);

export default router;
