import { injectable } from 'inversify';

export interface IAPIResponseMeta {
  code: number;
  exists: boolean;
  error_type: string;
  error_message: string;
}

@injectable()
export class APIResponseMeta implements IAPIResponseMeta {
  public code: number;
  public exists: boolean;
  public error_type: string;
  public error_message: string;

  constructor(_code: number) {
    this.code = _code;
  }
}
