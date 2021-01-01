/**
 * database/struct.ts stores the structure of the database
 */
import fs from 'fs';
import yaml from 'js-yaml';
import {
  UserPacket,
  StashPacket,
  DirectoryPacket,
  FileEntryPacket,
  User,
  Stash,
  Directory,
  FileEntry,
} from '../model/struct';
import {ResponsePacket, RequestError} from '../controller/struct';

interface TempObject {
  [hash: string]: string;
}

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

  /**
   * Load the mode and branch configuration from config file
   * @param {string} dirname
   */
  loadConfig(dirname: string) {
    /* Open up the configuration file in the folder */
    const dbConfigRAW: string | object | undefined = yaml.safeLoad(
      fs.readFileSync(dirname + '/config.yaml').toString()
    );

    let dbConfig: TempObject;
    if (typeof dbConfigRAW === 'object') dbConfig = dbConfigRAW as TempObject;
    else throw new Error('Cannot load database configuration.');

    if (
      Object.prototype.hasOwnProperty.call(dbConfig, 'mode') &&
      Object.prototype.hasOwnProperty.call(dbConfig, 'branch')
    ) {
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

  abstract verifyUser(data: User, res: ResponsePacket): Error;
  abstract putUser(data: any, res: ResponsePacket): Error;
  abstract getUser(userId: string, res: UserPacket): Error;
  abstract verifyStash(data: Stash, res: ResponsePacket): Error;
  abstract putStash(data: any, res: ResponsePacket): Error;
  abstract getStash(stashId: string, res: DirectoryPacket): Error;
  abstract getInventory(userId: string, res: StashPacket): Error;
  abstract verifyDirectory(data: Directory, res: ResponsePacket): Error;
  abstract putDirectory(data: any, res: ResponsePacket): Error;
  abstract getDirectory(stashId: string, res: DirectoryPacket): Error;
  abstract verifyFileEntry(data: FileEntry, res: ResponsePacket): Error;
  abstract putFileEntry(data: any, res: ResponsePacket): Error;
  abstract getFileEntry(directoryId: string, res: FileEntryPacket): Error;
}
