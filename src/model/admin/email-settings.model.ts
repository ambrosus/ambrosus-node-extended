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

export interface IEmailSettings {
  from: string;
  orgRegTo: string;
  apiKey: string;
  templateIds: {
    invite: string;
    orgReq: string;
    orgReqApprove: string;
    orgReqRefuse: string;
  };
}

@injectable()
export class EmailSettings implements IEmailSettings {

  private static checkVariable(variable) {
    if (variable === undefined) {
      return false;
    }
    return true;
  }
  public from: string;
  public orgRegTo: string;
  public apiKey: string;
  public templateIds: {
    invite: string;
    orgReq: string;
    orgReqApprove: string;
    orgReqRefuse: string;
  };

  public checkFieldsOK(payload) {
    return EmailSettings.checkVariable(payload.from) &&
      EmailSettings.checkVariable(payload.orgRegTo) &&
      EmailSettings.checkVariable(payload.apiKey) &&
      EmailSettings.checkVariable(payload.templateIds) &&
      EmailSettings.checkVariable(payload.templateIds.invite) &&
      EmailSettings.checkVariable(payload.templateIds.orgReq) &&
      EmailSettings.checkVariable(payload.templateIds.orgReqApprove) &&
      EmailSettings.checkVariable(payload.templateIds.orgReqRefuse);
  }
}
