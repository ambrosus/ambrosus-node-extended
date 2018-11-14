import { injectable } from 'inversify';
import { createLogger, format, transports } from 'winston';

import { config } from '../config';
import { ILogger } from '../interface/logger.inferface';
import * as Sentry from '@sentry/node';

@injectable()
export class LoggerService implements ILogger {
  private _logger;
  constructor() {
    const alignedWithColorsAndTime = format.combine(
      format.colorize(),
      format.timestamp(),
      format.align(),
      format.printf(info => {
        const { timestamp, level, message, ...args } = info;

        const ts = timestamp.slice(0, 19).replace('T', ' ');
        return `${ts} [${level}]: ${message} ${
          Object.keys(args).length ? JSON.stringify(args, undefined, 2) : ''
        }`;
      })
    );

    this._logger = createLogger({
      level: config.logging.level,
      format: alignedWithColorsAndTime,
      transports: [new transports.Console()],
    });
  }

  public debug(message: string, ...args: any[]): void {
    this.log('debug', message, args);
  }

  public info(message: string, ...args: any[]): void {
    this.log('info', message, args);
  }

  public warn(message: string, ...args: any[]): void {
    this.log('warn', message, args);
  }

  public error(message: string, ...args: any[]): void {
    this.log('error', message, args);
  }

  public captureError(error: Error, ...args: any[]): void {
    Sentry.captureException(error);
    this.log('error', error.message, [error.stack]);
  }

  private log(level: string, message: string, args: any[]): void {
    this._logger[level](`${message}`, args);
  }
}
