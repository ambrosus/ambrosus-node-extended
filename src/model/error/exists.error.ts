import { AmbrosusError } from './ambrosus.error';

export class ExistsError extends AmbrosusError {
  constructor(message) {
    super(`Duplicate: ${message}`);
  }
}
