/*
Copyright: Ambrosus Inc.
Email: tech@ambrosus.io

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/

import { config } from '../config';
import { injectable } from 'inversify';
import { readFile, writeFile, checkFileExists } from '../util/file';

@injectable()
export class StateService {
  private storeFilePath = config.statePath;
  private lock = false;
  private lockWaitMs = 50;

  public async write(key: string, value) {
    const contents = await this.readFile();
    contents[key] = value;
    await this.writeFile(contents);
  }

  public async read(key: string) {
    const contents = await this.readFile();
    if (contents[key] === undefined) {
      throw new Error(`The value for ${key} is missing in the store at ${this.storeFilePath}`);
    }
    return contents[key];
  }

  public async has(key: string) {
    const contents = await this.readFile();
    return contents[key] !== undefined;
  }

  public async readFile() {
    if (await checkFileExists(this.storeFilePath)) {
      return JSON.parse(String(await readFile(this.storeFilePath)));
    }

    return {};
  }

  public async writeFile(contents) {
    while (await this.isLocked()) {
      await this.isLocked();
    }
    this.lock = true;
    await writeFile(this.storeFilePath, JSON.stringify(contents, null, 2), {mode: 0o660})
          .finally(() => this.lock = false);
  }

  private isLocked = async(): Promise<boolean> => {
    if (this.lock) {
      await this.lockSleep(this.lockWaitMs);
      return true;
    }

    return false;
  }

  private lockSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
}
