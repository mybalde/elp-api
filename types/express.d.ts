import type { MyPayload } from "../middlewares/user.middleware";

declare global {
  namespace Express {
    interface Request {
      user?: MyPayload
    }
  }
}