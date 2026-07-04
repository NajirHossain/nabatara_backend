import type { TokenPayload } from "../utils/jwt.generator.js";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}
