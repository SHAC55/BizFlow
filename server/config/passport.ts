import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
} from "../constants/env";

type GoogleProfile = {
  displayName: string;
  emails?: Array<{
    value?: string;
  }>;
};

type VerifyDone = (
  error: Error | null,
  user?: {
    email: string;
    name: string;
    provider: string;
  },
) => void;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: unknown,
      done: VerifyDone,
    ) => {
      try {
        const googleProfile = profile as GoogleProfile;
        const email = googleProfile.emails?.[0]?.value;
        const name = googleProfile.displayName;

        if (!email) {
          return done(new Error("No email returned from Google"), undefined);
        }

        return done(null, { email, name, provider: "google" });
      } catch (err) {
        return done(err instanceof Error ? err : new Error("Google auth failed"));
      }
    },
  ),
);

export default passport;
