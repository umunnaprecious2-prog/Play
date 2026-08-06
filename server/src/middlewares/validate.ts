import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { AppError } from "../exceptions/AppError";

function validate(schema: ZodTypeAny, source: "body" | "params" | "query") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return next(AppError.unprocessable("Validation failed", result.error.flatten()));
    }

    // Express 5 defines req.query as a getter-only accessor (no setter), so a
    // plain `req.query = ...` throws. Redefining the property is the standard
    // workaround; req.body/req.params remain plain writable properties.
    if (source === "query") {
      Object.defineProperty(req, "query", { value: result.data, writable: true, configurable: true });
    } else {
      req[source] = result.data;
    }

    return next();
  };
}

export const validateBody = (schema: ZodTypeAny) => validate(schema, "body");
export const validateParams = (schema: ZodTypeAny) => validate(schema, "params");
export const validateQuery = (schema: ZodTypeAny) => validate(schema, "query");