import type { RequestHandler } from "express";
import appAssert from "../utils/appAssert";
import { UNAUTHORIZED } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";
import { verifyToken } from "../utils/jwt";
import { getAccessTokenFromRequest } from "../utils/requestAuth";

const authenticate: RequestHandler = (req, res, next) => {
  const accessToken = getAccessTokenFromRequest(req);
  appAssert(
    accessToken,
    UNAUTHORIZED,
    "unauthorized access denied",
    AppErrorCode.InvalidAccessToken,
  );
  const { error, payload } = verifyToken(accessToken);
  appAssert(
    payload,
    UNAUTHORIZED,
    error === "jwt expired" ? "token expired" : "invalid token",
    AppErrorCode.InvalidAccessToken,
  );
  req.userId = payload.userId;
  req.sessionId = payload.sessionId;
  next();
};
export default authenticate;
