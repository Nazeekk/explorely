import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  console.error(err.stack);

  const status = 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).send({
    error: true,
    message: message,
  });
}
