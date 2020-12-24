/**
 * model.ts
 * The model of the bali server. This is the model that will be call by
 * handlers and it will not be interacting with the database directory. Instead
 * there will be database modules to interact with database that reinforces the
 * models.
 */

import './struct';
import {logger} from '../../index';
import {
  User,
  Stash,
  Directory,
  FileEntry,
  UserPacket,
  StashPacket,
  DirectoryPacket,
  FileEntryPacket,
  ChangeResultPacket,
} from './struct';

/* Import all different database */
import Database from '../database/database';
import RAMDatabase from '../database/ram/store';

class DBDistributor {
  databases: Database[];
  activeDb: Database;

  constructor() {
    logger.write.info('DBDistributor initializing...');

    this.databases = [new RAMDatabase()];
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

    this.putUser = this.putUser.bind(this);
    this.getUser = this.getUser.bind(this);
  }

  putUser(data: User, res: ChangeResultPacket): Error {
    return this.activeDb.putUser(data, res);
  }

  getUser(userId: string, res: UserPacket): Error {
    return this.activeDb.getUser(userId, res);
  }
}

export const dbDistributor = new DBDistributor();

/*******************************************************************************
 *
 * User table
 *
 ******************************************************************************/

export function putUser(newUser: User, res: ChangeResultPacket): Error {
  return null as any;
}

export function getUser(userId: string, res: UserPacket): Error {
  return null as any;
}

/*******************************************************************************
 *
 * Stash table
 *
 ******************************************************************************/

export function putStash(newStash: Stash, res: ChangeResultPacket): Error {
  return null as any;
}

export function getStash(stashId: string, res: StashPacket): Error {
  return null as any;
}

/*******************************************************************************
 *
 * Directory table
 *
 ******************************************************************************/

export function putDirectory(
  newDirectory: Directory,
  res: ChangeResultPacket
): Error {
  return null as any;
}

export function getDirectory(directoryId: string, res: DirectoryPacket): Error {
  return null as any;
}

/*******************************************************************************
 *
 * FileEntry table
 *
 ******************************************************************************/

export function putFileEntry(
  newFileEntry: FileEntry,
  res: ChangeResultPacket
): Error {
  return null as any;
}

export function getFileEntry(fileEntryId: string, res: FileEntryPacket): Error {
  return null as any;
}
