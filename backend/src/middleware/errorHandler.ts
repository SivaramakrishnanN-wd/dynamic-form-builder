import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
}

// Express 4-style error handler (4-argument signature required)
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500;
  const message = err.message ?? "Internal Server Error";

  console.error(`[Error] ${statusCode}: ${message}`);

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
