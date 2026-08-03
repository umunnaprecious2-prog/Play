import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { AppError } from "../exceptions/AppError";

function validate(schema: ZodTypeAny, source: "body" | "params" | "query") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return next(AppError.unprocessable("Validation failed", result.error.flatten()));
    }

    req[source] = result.data;
    return next();
  };
}

export const validateBody = (schema: ZodTypeAny) => validate(schema, "body");
export const validateParams = (schema: ZodTypeAny) => validate(schema, "params");
export const validateQuery = (schema: ZodTypeAny) => validate(schema, "query");