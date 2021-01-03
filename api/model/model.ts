/**
 * model.ts
 * The model of the bali server. This is the model that will be call by
 * handlers and it will not be interacting with the database directory. Instead
 * there will be database modules to interact with database that reinforces the
 * models.
 */

import './type';
import {logger} from '../../index';
import {
  UserPacket,
  StashPacket,
  DirectoryPacket,
  FileEntryPacket,
} from './type';
import {ResponsePacket} from '../controller/struct';

/* Import all different database */
import Database from '../database/database';
import RAMDatabase from '../database/ram/RAMDatabase';

class DBDistributor {
  databases: Database[];
  activeDb: Database;

  constructor() {
    logger.write.info('DBDistributor initializing...');

    this.databases = [new RAMDatabase(logger)];
    this.activeDb = null as any;

    /* Find the database that matches the configuration */
    if (process.env.NODE_ENV !== undefined) {
      const vars: string[] = process.env.NODE_ENV.split(' ');
      const mode: string = vars[0];
      const branch: string = vars[1];

      for (const db of this.databases) {
        if (db.match(mode, branch)) {
          logger.write.info(`Database: [mode: ${mode} && branch: ${branch}]`);

          this.activeDb = db;
          break;
        }
      }

      if (this.activeDb === null)
        throw new Error(
          `Cannot find database of [mode: ${mode} && branch: ${branch}]`
        );
    }
  }

  /**
   * Write user to the active database
   * @param {any} data
   * @param {ResponsePacket} res
   * @return {Error | null}
   */
  putUser(data: any, res: ResponsePacket): Error {
    return this.activeDb.putUser(data, res);
  }

  /**
   * Retrive user from the active database
   * @param {string} userId
   * @param {UserPacket} res
   * @return {Error | null}
   */
  getUser(userId: string, res: UserPacket): Error {
    return this.activeDb.getUser(userId, res);
  }

  /**
   * Write stash to the active database
   * @param {any} data
   * @param {ResponsePacket} res
   * @return {Error | null}
   */
  putStash(data: any, res: ResponsePacket): Error {
    return this.activeDb.putStash(data, res);
  }

  /**
   * Retrieve directories and files of the stash from the active database
   * @param {any} data
   * @param {DirectoryPacket} res
   * @return {Error | null}
   */
  getStash(stashId: string, res: DirectoryPacket): Error {
    return this.activeDb.getStash(stashId, res);
  }

  /**
   * Retrive stash from the active database
   * @param {string} stashId
   * @param {StashPacket} res
   * @return {Error | null}
   */
  getInventory(inventoryId: string, res: StashPacket): Error {
    return this.activeDb.getInventory(inventoryId, res);
  }

  /**
   * Write directory to the active database
   * @param {any} data
   * @param {ResponsePacket} res
   * @return {Error | null}
   */
  putDirectory(data: any, res: ResponsePacket): Error {
    return this.activeDb.putDirectory(data, res);
  }

  /**
   * Retrive directory from the active database
   * @param {string} directoryId
   * @param {DirectoryPacket} res
   * @return {Error | null}
   */
  getDirectory(directoryId: string, res: DirectoryPacket): Error {
    return this.activeDb.getDirectory(directoryId, res);
  }

  /**
   * Write file to the active database
   * @param {any} data
   * @param {ResponsePacket} res
   * @return {Error | null}
   */
  putFileEntry(data: any, res: ResponsePacket): Error {
    return this.activeDb.putFileEntry(data, res);
  }

  /**
   * Retrive file from the active database
   * @param {string} userId
   * @param {FileEntry} res
   * @return {Error | null}
   */
  getFileEntry(fileEntryId: string, res: FileEntryPacket): Error {
    return this.activeDb.getFileEntry(fileEntryId, res);
  }
}

export const dbDistributor = new DBDistributor();
