import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { AppError } from "../utils/AppError.js";

<<<<<<< HEAD
=======
const validationDetails = (error: { issues: Array<{ path: PropertyKey[]; message: string }> }) =>
  error.issues.map((issue) => ({
    attribute: issue.path.join("."),
    message: issue.message,
  }));

export const parseListQuery = <T>(schema: ZodType<T>, query: unknown): T => {
  const result = schema.safeParse(query);

  if (!result.success) {
    throw new AppError(
      400,
      "INVALID_PAGINATION",
      "Los parámetros de consulta son inválidos",
      validationDetails(result.error),
    );
  }

  return result.data;
};

>>>>>>> develop
export const schemaValidator = (schema: ZodType) => {
  const validate: RequestHandler = (req, _res, next): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(new AppError(
        400,
        "VALIDATION_ERROR",
        "La solicitud contiene datos inválidos",
        result.error.issues.map((issue) => ({
          attribute: issue.path.join("."),
          message: issue.message,
        })),
      ));
      return;
    }

    req.body = result.data;
    next();
  };

  return validate;
};

export const validateIdParam: RequestHandler = (req, _res, next): void => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    next(new AppError(400, "INVALID_ID", "El id debe ser un entero positivo"));
    return;
  }
  next();
};