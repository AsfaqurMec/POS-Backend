import jwt from "jsonwebtoken";
import { ENV } from "../config/env";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface ManagerOverridePayload {
  managerId: string;
  managerName: string;
  role: "ADMIN";
  action: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;
}

export function signManagerToken(payload: ManagerOverridePayload): string {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: "90s",
  });
}

export function verifyManagerToken(token: string): ManagerOverridePayload {
  return jwt.verify(token, ENV.JWT_SECRET) as ManagerOverridePayload;
}