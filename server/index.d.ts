declare global {
  namespace Express {
    interface Request {
      userId?: number;
      sessionId?: number;
      user?: {
        email: string;
        name: string;
        provider: string;
      };
    }
  }
}

export {};
