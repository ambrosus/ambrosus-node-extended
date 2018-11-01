export class AmbrosusError extends Error {
  constructor(message, public code: number) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
