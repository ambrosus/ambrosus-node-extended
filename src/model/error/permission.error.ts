import { AmbrosusError } from './ambrosus.error';

export class PermissionError extends AmbrosusError {
  constructor(message) {
    super(`Permission denied: ${message}`, 403);
  }
}
