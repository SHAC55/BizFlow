import { Router } from "express";
import passport from "../config/passport";
import authenticate from "../middleware/authenticate";
import {
  forgotPasswordHandler,
  googleAuthCallbackHandler,
  loginHandler,
  logoutHandler,
  onboardingHandler,
  refreshHandler,
  registerHandler,
  resetPasswordHandler,
  verifyEmailHandler,
} from "../controllers/auth.controller";

const authRoutes = Router();

// Standard auth
authRoutes.post("/register", registerHandler);
authRoutes.post("/login", loginHandler);
authRoutes.get("/refresh", refreshHandler);
authRoutes.get("/logout", logoutHandler);
authRoutes.get("/email/verify/:code", verifyEmailHandler);
authRoutes.post("/password/forgot", forgotPasswordHandler);
authRoutes.post("/password/reset", resetPasswordHandler);

// Google OAuth
authRoutes.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);
authRoutes.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.APP_ORIGIN}/login?error=google_failed`,
  }),
  googleAuthCallbackHandler,
);

// Onboarding
authRoutes.post("/onboarding", authenticate, onboardingHandler);

export default authRoutes;
