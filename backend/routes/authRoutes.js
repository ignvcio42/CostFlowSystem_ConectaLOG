import express from 'express';
import { signupUser, signinUser, verifyEmail, resendVerificationEmail, requestPasswordReset, resetPassword  } from '../controllers/authController.js';

const router = express.Router();

router.post("/sign-up", signupUser);
router.post("/sign-in", signinUser);

router.get("/verify-email", verifyEmail);  // <-- este
router.post("/resend-verification", resendVerificationEmail );
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);


export default router;