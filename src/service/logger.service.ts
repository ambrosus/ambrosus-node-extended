/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.io
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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
          Object.keys(args).length ? JSON.stringify(args) : ''
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
