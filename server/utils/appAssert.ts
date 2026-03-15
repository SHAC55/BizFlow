import type AppErrorCode from "../constants/appErrorCode";
import type { HttpStatusCode } from "../constants/http";
import assert from "node:assert";
import AppError from "./appErrors";
type appAssert = (
  condition: any,
  httpStatusCode: HttpStatusCode,
  message: string,
  appErrorCode?: AppErrorCode,
) => asserts condition;
const appAssert: appAssert = (
  condition,
  httpStatusCode,
  message,
  appErrorCode,
) => assert(condition, new AppError(httpStatusCode, message, appErrorCode));

export default appAssert;
