import type AppErrorCode from "../constants/appErrorCode";
import { type HttpStatusCode } from "../constants/http";

class AppError extends Error {
  constructor(
    public statusCode: HttpStatusCode,
    public override message: string,
    public errorCode?: AppErrorCode,
  ) {
    super(message);
  }
}
export default AppError;
