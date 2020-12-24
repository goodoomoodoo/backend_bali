/**
 * store.ts stores the general function to access the store data
 */
import {logger} from '../../../index';
import Database from '../database';
import {User, UserPacket, ChangeResultPacket} from '../../model/struct';
import {Store} from './struct';
import {version} from 'yargs';

export default class RAMDatabase extends Database {
  store: Store;

  constructor() {
    super();
    this.store = {users: {}};

    /* Load the mode and branch from the configuration yaml file */
    this.loadConfig(__dirname);
  }

  convertToUser(data: any): User {
    if (
      !data.hasOwnProperty('id') &&
      !data.hasOwnProperty('firstName') &&
      !data.hasOwnProperty('lastName') &&
      !data.hasOwnProperty('email') &&
      !data.hasOwnProperty('version')
    )
      return null as any;

    return {
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      version: data.version,
    };
  }

  /**
   * Write data to the local store
   * @param {User} data
   * @param {ChangeResultPacket} res
   * @return {Error | null}
   */
  putUser(data: any, res: ChangeResultPacket): Error {
    logger.write.info(`RAMDatabase: putUser(): user ${data.id}.`);

    const dataUser: User = this.convertToUser(data);

    /* If dataUser is null, meaning the data sent is invalid */
    if (dataUser === null) {
      res.data = false;
      return null as any;
    }

    /* Check if the user id exists already */
    if (this.store.users.hasOwnProperty(dataUser.id)) {
      const currentUser: User = this.store.users[data.id];
      const versionGap: number = data.version - currentUser.version;

      /* Make sure the next coming version should have 1 exact increment */
      if (versionGap != 1) {
        res.data = false;
        return null as any;
      }

      /* This will not work if two users happen to have same id and same
      version, which is very unlikely. */
    }

    this.store.users[dataUser.id] = dataUser;
    res.data = true;

    return null as any;
  }

  /**
   * Retreive data from the local store
   * @param {string} userId
   * @param {UserPacket} res
   * @return {Error | null}
   */
  getUser(userId: string, res: UserPacket): Error {
    if (
      this.store.hasOwnProperty('users') &&
      this.store.users.hasOwnProperty(userId)
    ) {
      logger.write.info(`RAMDatabase: getUser(): user ${userId}.`);

      res.data = this.store.users[userId];
      return null as any;
    } else {
      logger.write.info(`RAMDatabase: getUser(): ${userId} not found.`);

      res.data = null as any;
      return null as any;
    }
  }
}
