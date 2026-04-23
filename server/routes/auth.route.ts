import { Router } from "express";
import passport from "../config/passport";
import { APP_ORIGIN } from "../constants/env";
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
import {
  decodeGoogleMobileState,
  encodeGoogleMobileState,
} from "../utils/requestAuth";

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
authRoutes.get("/google", (req, res, next) => {
  const mobileRedirectUri =
    typeof req.query.mobile_redirect_uri === "string"
      ? req.query.mobile_redirect_uri
      : undefined;

  const state = mobileRedirectUri
    ? encodeGoogleMobileState({ redirectUri: mobileRedirectUri })
    : undefined;

  return passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    state,
  })(req, res, next);
});

authRoutes.get("/google/callback", (req, res, next) => {
  const mobileState = decodeGoogleMobileState(
    typeof req.query.state === "string" ? req.query.state : undefined,
  );

  return passport.authenticate(
    "google",
    { session: false },
    (error: Error | null, user?: Express.User | false) => {
      if (error || !user) {
        if (mobileState) {
          const redirectUrl = new URL(mobileState.redirectUri);
          redirectUrl.searchParams.set("error", "google_failed");
          return res.redirect(redirectUrl.toString());
        }

        return res.redirect(`${APP_ORIGIN}/login?error=google_failed`);
      }

      req.user = user;
      return next();
    },
  )(req, res, next);
}, googleAuthCallbackHandler);

// Onboarding
authRoutes.post("/onboarding", authenticate, onboardingHandler);

export default authRoutes;
