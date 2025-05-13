import express from 'express';
import authMiddleware, { isAdmin } from '../middleware/authMiddleware.js';
import { changePassword, changeUserEstado, getAllRoleUsers, getUser, updateUser } from '../controllers/userController.js';

const router = express.Router();


router.get('/', authMiddleware, getUser);
router.put('/change-password', authMiddleware, changePassword);
router.put('/', authMiddleware, updateUser);

router.get("/admin/users", authMiddleware, isAdmin, getAllRoleUsers);
router.put("/admin/users/:id/estado", authMiddleware, isAdmin, changeUserEstado);

export default router;