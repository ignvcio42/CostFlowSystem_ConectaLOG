import express from 'express';
import { signupUser, signinUser, verifyEmail, resendVerificationEmail  } from '../controllers/authController.js';

const router = express.Router();

router.post("/sign-up", signupUser);
router.post("/sign-in", signinUser);

router.get("/verify-email", verifyEmail);  // <-- este
router.post("/resend-verification", resendVerificationEmail );

export default router;