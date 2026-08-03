import type { NextFunction, Request, Response } from "express";
import { AppError } from "../exceptions/AppError";

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(AppError.notFound("Route not found"));
}