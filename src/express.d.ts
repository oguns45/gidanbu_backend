import { IUser } from "../utils/interface.util";
import { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: IUser;
  }
}