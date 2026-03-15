declare global {
  namespace Express {
    interface Request {
      userId?: number;
      sessionId?: number;
    }
  }
}

export {};
