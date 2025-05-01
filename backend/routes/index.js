import express from 'express';
import authRoutes from './authRoutes.js';
// import accountRoutes from './accountRoutes.js';
// import transactionRoutes from './transactionRoutes.js';
import userRoutes from './userRoutes.js';
// import consultas_historicas from './consultas_historicas.js';

const router = express.Router();

router.use('/auth', authRoutes);
// router.use('/account', accountRoutes);
// router.use('/transaction', transactionRoutes);
router.use('/user', userRoutes);
// router.use('/consultas_historicas', consultas_historicas);

export default router;