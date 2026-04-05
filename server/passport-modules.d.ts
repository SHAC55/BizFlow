declare module "passport" {
  import type { RequestHandler } from "express";

  const passport: {
    use: (strategy: unknown) => void;
    initialize: () => RequestHandler;
    authenticate: (
      strategy: string,
      options?: Record<string, unknown>,
    ) => RequestHandler;
  };

  export default passport;
}

declare module "passport-google-oauth20" {
  export class Strategy {
    constructor(
      options: {
        clientID: string;
        clientSecret: string;
        callbackURL: string;
      },
      verify: (
        accessToken: string,
        refreshToken: string,
        profile: unknown,
        done: (error: Error | null, user?: unknown) => void,
      ) => void | Promise<void>,
    );
  }
}
