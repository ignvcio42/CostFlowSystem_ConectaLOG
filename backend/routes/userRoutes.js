import express from 'express';
import authMiddleware, { isAdmin } from '../middleware/authMiddleware.js';
import { actualizarPeriodoValidez, changePassword, changeUserEstado, disableOwnUser, getAllRoleUsers, getUser, obtenerPeriodoValidez, updateUser } from '../controllers/userController.js';

const router = express.Router();


router.get('/', authMiddleware, getUser);
router.put('/change-password', authMiddleware, changePassword);
router.put('/', authMiddleware, updateUser);
router.post('/actualizar-datos', authMiddleware, actualizarPeriodoValidez); // Actualizar datos históricos
router.get('/periodo-validez', authMiddleware, obtenerPeriodoValidez); // Obtener periodo de validez preferido

router.get("/admin/users", authMiddleware, isAdmin, getAllRoleUsers);
router.put("/admin/users/:id/estado", authMiddleware, isAdmin, changeUserEstado);

router.put('/disable', authMiddleware, disableOwnUser); // authMiddleware para extraer userId del token

export default router;