/**
 * database/struct.ts stores the structure of the database
 */
import fs from 'fs';
import yaml from 'js-yaml';
import {User, UserPacket, ChangeResultPacket} from '../model/struct';

export default abstract class Database {
  mode: string;
  branch: string;

  constructor() {
    /* Bind instance method */
    this.loadConfig = this.loadConfig.bind(this);
    this.match = this.match.bind(this);

    this.mode = '';
    this.branch = '';
  }

  loadConfig(dirname: string) {
    /* Open up the configuration file in the folder */
    const dbConfig: any = yaml.safeLoad(
      fs.readFileSync(dirname + '/config.yaml').toString()
    );

    if (dbConfig.hasOwnProperty('mode') && dbConfig.hasOwnProperty('branch')) {
      this.mode = dbConfig.mode;
      this.branch = dbConfig.branch;
    } else {
      throw new Error('Configuration error: mode or branch not found.');
    }
  }

  /**
   * Check whether if the given mode and branch fits the database
   * @param {string} mode execution mode, i.e. production and development
   * @param {string }branch database type, i.e. RAM, local, remote
   * @return {boolean}
   */
  match(mode: string, branch: string): boolean {
    return this.mode === mode && this.branch === branch;
  }

  abstract putUser(data: User, res: ChangeResultPacket): Error;
  abstract getUser(userId: string, res: UserPacket): Error;
}
