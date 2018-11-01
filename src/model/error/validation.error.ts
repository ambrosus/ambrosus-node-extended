import { AmbrosusError } from './ambrosus.error';

export class ValidationError extends AmbrosusError {
  constructor(message, code: number) {
    super(`Invalid data: ${message}`, code);
  }
}
