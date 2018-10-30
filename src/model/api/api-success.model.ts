export interface IAPIMessage {
  message: string;
}

export class APISuccess implements IAPIMessage {
  public message;
  constructor(_action: string) {
    this.message = `${_action} completed successfully`;
  }
}
