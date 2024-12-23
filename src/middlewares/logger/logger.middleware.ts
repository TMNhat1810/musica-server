import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, params, query, body } = req;

    res.on('finish', () => {
      this.logger.log(`${method} ${res.statusCode} ${originalUrl}`);
      this.logger.debug(
        `\nParams: ${JSON.stringify(params)} \nQuery: ${JSON.stringify(query)} \nBody: ${JSON.stringify(body)}`,
      );
    });

    next();
  }
}
