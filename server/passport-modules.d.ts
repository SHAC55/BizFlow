declare module "passport" {
  import type {
    NextFunction,
    Request,
    RequestHandler,
    Response,
  } from "express";

  type AuthenticateCallback = (
    error: Error | null,
    user?: Express.User | false,
    info?: unknown,
    status?: number | Record<string, unknown>,
  ) => void;

  const passport: {
    use: (strategy: unknown) => void;
    initialize: () => RequestHandler;
    authenticate: {
      (strategy: string, options?: Record<string, unknown>): RequestHandler;
      (
        strategy: string,
        options: Record<string, unknown>,
        callback: AuthenticateCallback,
      ): (req: Request, res: Response, next: NextFunction) => void;
    };
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
