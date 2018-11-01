import { AmbrosusError } from './ambrosus.error';

export class ExistsError extends AmbrosusError {
  constructor(message) {
    super(`Exists: ${message}`, 400);
  }
}
