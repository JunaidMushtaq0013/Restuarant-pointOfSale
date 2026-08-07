import { JwtUser } from "../features/auth/auth.types.js";

declare global {
  namespace Express {
    interface Request {
      user: JwtUser;
    }
  }
}

export {};