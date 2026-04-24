declare global {
  namespace Express {
    interface User {
      email: string;
      name: string;
      provider: string;
    }

    interface Request {
      userId?: number;
      sessionId?: number;
      user?: User;
    }
  }
}

export {};
