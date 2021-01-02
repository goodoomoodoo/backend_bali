/**
 * store.ts stores the general function to access the store data
 *
 * Note: the put subroutine can be refractored into a function to shorten the
 * code.
 */
import {logger} from '../../../index';
import Database from '../database';
import * as type from '../../model/type';
import * as util from "../../model/util";
import {ResponsePacket, RequestError} from '../../controller/struct';
import {Store, ModelStore, StashStore, treeStore} from './Store';

/**
 * Store Iterator
 */
class StoreIterator<T extends type.Model, W extends ModelStore<T>> {
  store: W;
  root: T;

  /**
   * @param {ModelStore<ModelItem>} anyStore
   */
  constructor(anyStore: W) {
    this.store = anyStore;
    this.root = null as any;

    this.begin = this.begin.bind(this);
    this.next = this.next.bind(this);
  }

  begin(anyId: string): StoreIterator<T, W> {
    this.root = this.store[anyId];
    return this;
  }

  next(): T {
    if (this.root !== null) {
      const value: T = this.root;

      if (value.next === '\0') {
        this.root = null as any; // End of linked list
      } else if (Object.prototype.hasOwnProperty.call(this.store, value.next)) {
        this.root = this.store[value.next];
      } else {
        logger.write.error(
          `Internal error detected: next node ${value.next} does not exists.`
        );
        this.root = null as any;
      }

      return value;
    } else {
      return null as any;
    }
  }

  hasNext(): boolean {
    return this.root !== null;
  }

  end(): any {
    return null;
  }
}

export default class RAMDatabase extends Database {
  store: Store;

  constructor() {
    super();
    this.store = {
      users: {},
      inventories: {},
      stashes: {},
      fileTree: {},
    };

    /* Load the mode and branch from the configuration yaml file */
    this.loadConfig(__dirname);
  }

  /**
   * Verify the uploaded user is a valid descendant
   * @param  type.User} data
   * @param {ResponsePacket} res
   * @return {Error | null}
   */
  verifyUser(data: type.User, res: ResponsePacket): Error {
    /* Check if the conversion is successful */
    if (data === null) {
      res.data = {
        id: RequestError.INVALID_USER,
        success: false,
        message: 'Request error: invalid user object.',
      };
      return null as any;
    }

    /* User exists in the store */
    if (Object.prototype.hasOwnProperty.call(this.store.users, data.id)) {
      const currentUser: type.User = this.store.users[data.id];

      /* Make sure the next coming version should have 1 exact increment */
      if (!util.isNextVersion(currentUser, data)) {
        /* Security: do not return version number */
        res.data = {
          id: RequestError.INVALID_VERSION,
          success: false,
          message: 'Request error: version provided out of order',
        };
        return null as any;

        /* This will not work if two users happen to have same id and same
        version, which is very unlikely. */
      }
    } else {
      /* If user doesn't exists, make sure the inventory id has not been
      occupied */
      if (
        Object.prototype.hasOwnProperty.call(
          this.store.inventories,
          data.inventory
        )
      ) {
        res.data = {
          id: RequestError.INVALID_INVENTORY,
          success: false,
          message: 'Request error: inventory already exists.',
        };

        return null as any;
      }
    }

    res.data = {id: RequestError.NONE, success: true, message: ''};
    return null as any;
  }

  /**
   * Write user to the database
   * @param {any} data
   * @param {ResponsePacket} res
   * @return {Error | null}
   */
  putUser(data: any, res: ResponsePacket): Error {
    const dataUser: type.User = util.convertToMod(
     type.UserPropsKey,
      data
    ) as type.User;

    logger.write.info(`RAMDatabase: putUser(): user ${data.id}.`);

    /* Run database logics and ensure database constraints */
    const error: Error = this.verifyUser(dataUser, res);

    if (error !== null) return error;
    else if (!res.data.success) return null as any;

    /* Check if the user id exists already */
    if (!Object.prototype.hasOwnProperty.call(this.store.users, data.id)) {
      /* Create new user and inventory, inventory does not exists */
      this.store.inventories[dataUser.inventory] = {
        id: dataUser.inventory,
        owner: dataUser.id,
        stashRoot: '\0',
        version: 1,
      };
    }

    /* Data write */
    this.store.users[dataUser.id] = dataUser;
    res.data = {
      id: RequestError.NONE,
      success: true,
      message: 'Put request success.',
    };

    return null as any;
  }

  /**
   * Retreive user from the database
   * @param {string} userId
   * @param {UserPacket} res
   * @return {Error | null}
   */
  getUser(userId: string, res: type.UserPacket): Error {
    if (Object.prototype.hasOwnProperty.call(this.store.users, userId)) {
      logger.write.info(`RAMDatabase: getUser(): user ${userId}.`);

      res.data = this.store.users[userId];
      return null as any;
    } else {
      logger.write.info(`RAMDatabase: getUser(): ${userId} not found.`);

      res.data = null as any;
      return null as any;
    }
  }

  /**
   * Verify the uploaded Stash
   * @param  type.Stash} data
   * @param {ResponsePacket} res
   * @return {Error | null}
   */
  verifyStash(data: type.Stash, res: ResponsePacket): Error {
    /* Check if the conversion is successful */
    if (data === null) {
      res.data = {
        id: RequestError.INVALID_STASH,
        success: false,
        message: 'Request error: invalid stash object.',
      };
      return null as any;
    }

    if (Object.prototype.hasOwnProperty.call(this.store.stashes, data.id)) {
      const currentStash: type.Stash = this.store.stashes[data.id];

      /* Make sure the next coming version should have 1 exact increment */
      if (!util.isNextVersion(currentStash, data)) {
        /* Security: do not return version number */
        res.data = {
          id: RequestError.INVALID_VERSION,
          success: false,
          message: 'Request error: version provided out of order',
        };
        return null as any;
      }

      /* Make sure the change request is submitted by the owner */
      if (currentStash.owner != data.owner) {
        res.data = {
          id: RequestError.UNAUTHORIZED_CHANGE,
          success: false,
          message: 'Request error: stash can only be changed by owner.',
        };
        return null as any;
      }
    }

    res.data = {id: RequestError.NONE, success: true, message: ''};
    return null as any;
  }

  /**
   * Write stash to the database
   * @param {any} data
   * @param {ResponsePacket} res
   * @return {Error | null}
   */
  putStash(data: any, res: ResponsePacket): Error {
    /* Returns null if data not convertable */
    const dataStash: type.Stash = util.convertToMod(
     type.StashPropsKey,
      data
    ) as type.Stash;

    logger.write.info(`RAMDatabase: putStash(): stash ${data.id}.`);

    const error: Error = this.verifyStash(dataStash, res);

    if (error !== null) return error;
    else if (!res.data.success) return null as any;

    /* If the stash id exists already */
    if (
      Object.prototype.hasOwnProperty.call(this.store.stashes, dataStash.id)
    ) {
      const currentStash: type.Stash = this.store.stashes[dataStash.id];

      /* Merge uploaded data stash to the stash store linked list */
      dataStash.next = currentStash.next;
    } else {
      logger.write.info('RAMDatabase: putStash(): add stash to inventory.');

      /* Find the inventory the user owns */
      const currentUser: type.User = this.store.users[dataStash.owner];
      const currentInventory: type.Inventory = this.store.inventories[
        currentUser.inventory
      ];

      /* Insert the stash ID to the linked list */
      if (currentInventory.stashRoot !== '\0') {
        logger.write.debug(
          'RAMDatabase: putStash(): insert to stashRoot ' +
            currentInventory.stashRoot +
            '.'
        );

        const stashRoot: type.Stash = this.store.stashes[
          currentInventory.stashRoot
        ];

        dataStash.next = stashRoot.next;
        stashRoot.next = dataStash.id;
        this.store.stashes[currentInventory.stashRoot] = stashRoot;
      } else {
        logger.write.debug('RAMDatabase: putStash(): create new stashRoot.');
        currentInventory.stashRoot = dataStash.id;
        this.store.inventories[currentInventory.id] = currentInventory;
      }
    }

    /* Copy the next node over */
    this.store.stashes[dataStash.id] = dataStash;
    res.data = {
      id: RequestError.NONE,
      success: true,
      message: 'Put request success.',
    };

    return null as any;
  }

  /**
   * Retrieve immediate fileTree and files of stash
   * @param {string} stashId
   * @param {string} res
   * @return {Error | null}
   */
  getStash(stashId: string, res: type.DirectoryPacket): Error {
    logger.write.info(`RAMDatabase: getStash(): stash ${stashId}.`);

    if (Object.prototype.hasOwnProperty.call(this.store.stashes, stashId)) {
      logger.write.info('RAMDatabase: getStash(): iterating file tree.');

      const resultArr: type.ModelFile[] = [];
      const dataStash: type.Stash = this.store.stashes[stashId];
      const root: string = dataStash.child;
      const storeItr: StoreIterator<
        type.ModelFile,
        treeStore
      > = new StoreIterator(this.store.fileTree);
      storeItr.begin(root);

      while (storeItr.hasNext()) resultArr.push(storeItr.next());

      res.data = resultArr;
      logger.write.debug(`RAMDatabase: getStash(): ${resultArr}`);

      return null as any;
    } else {
      logger.write.info('RAMDatabase: getStash(): stash not found.');
      return null as any;
    }
  }

  /**
   * Retreive stash from the database
   * @param {string} userId
   * @param {StashPacket} res
   * @return {Error | null}
   */
  getInventory(userId: string, res: type.StashPacket): Error {
    if (Object.prototype.hasOwnProperty.call(this.store.users, userId)) {
      logger.write.info(`RAMDatabase: getInventory(): user's stash ${userId}.`);

      const currentUser: type.User = this.store.users[userId];

      /* Internal detector for process error */
      if (
        !Object.prototype.hasOwnProperty.call(
          this.store.inventories,
          currentUser.inventory
        )
      ) {
        return new Error('Internal error detected: inventory not created.');
      }

      /* Get the inventory */
      const currentInventory: type.Inventory = this.store.inventories[
        currentUser.inventory
      ];

      /* Get all hashes of the stash ID */
      let stashRoot: string = currentInventory.stashRoot;
      const stashList: type.Stash[] = [];

      while (stashRoot !== '\0') {
        logger.write.debug(`RAMDatabase: getInventory(): stashId ${stashRoot}`);

        /* Make sure the stash ID created do exists */
        if (!this.store.stashes.hasOwnProperty(stashRoot)) {
          return new Error('Internal error detected: stash not created.');
        }

        const currentStash: type.Stash = this.store.stashes[stashRoot];
        stashList.push(currentStash);
        stashRoot = currentStash.next;
      }

      res.data = stashList;

      return null as any;
    } else {
      logger.write.info(`RAMDatabase: getInventory(): ${userId} not found.`);

      res.data = null as any;
      return null as any;
    }
  }

  /**
   * Verify the uploaded directory
   * @param  type.Directory} data
   * @param {ResponsePacket} res
   * @return {Error | null}
   */
  verifyDirectory(data: type.Directory, res: ResponsePacket): Error {
    /* Check if the conversion is successful */
    if (data === null) {
      res.data = {
        id: RequestError.INVALID_DIRECTORY,
        success: false,
        message: 'Request error: invalid directory object.',
      };
      return null as any;
    }

    /* If the directory has last version */
    if (Object.prototype.hasOwnProperty.call(this.store.fileTree, data.id)) {
      const currentFileTree: type.ModelFile = this.store.fileTree[data.id];

      /* Verify that the owner, the stash, and the parent are the same. */
      if (
        currentFileTree.stash != data.stash ||
        currentFileTree.owner != data.owner ||
        currentFileTree.parent != data.parent
      ) {
        res.data = {
          id: RequestError.UNAUTHORIZED_CHANGE,
          success: false,
          message: 'Request error: unauthorized changes of directory.',
        };
        return null as any;
      }

      /* Verify version descendant */
      if (!util.isNextVersion(currentFileTree, data)) {
        /* Security: do not return version number */
        res.data = {
          id: RequestError.INVALID_VERSION,
          success: false,
          message: 'Request error: version provided out of order',
        };
        return null as any;
      }

      /* Verify parent's existence */
      if (
        !Object.prototype.hasOwnProperty.call(
          this.store.fileTree,
          currentFileTree.parent
        ) ||
        Object.prototype.hasOwnProperty.call(
          this.store.stashes,
          currentFileTree.parent
        )
      )
        return new Error(
          "Internal error detected: original directory's parent has not been " +
            'created.'
        );
    } else {
      /* Verify parent do exists */
      if (
        !this.store.fileTree.hasOwnProperty(data.parent) &&
        !this.store.stashes.hasOwnProperty(data.parent)
      ) {
        res.data = {
          id: RequestError.INVALID_DIRECTORY,
          success: false,
          message: 'Request error: directory parent does not exists.',
        };
        return null as any;
      }
    }

    res.data = {id: RequestError.NONE, success: true, message: ''};
    return null as any;
  }

  /**
   * Write directory to the database
   * @param {any} data
   * @param {ResponsePacket} res
   * @return {Error | null}
   */
  putDirectory(data: any, res: ResponsePacket): Error {
    const dataDirectory: type.Directory = util.convertToMod(
     type.DirectoryPropsKey,
      data
    ) as type.Directory;

    logger.write.info(`RAMDatabase: putDirectory(): directory ${data.id}.`);

    /* Check if the directory has been created */
    if (
      Object.prototype.hasOwnProperty.call(
        this.store.fileTree,
        dataDirectory.id
      )
    ) {
      logger.write.debug('RAMDatabase: putDirectory(): update directory.');
    } else {
      logger.write.debug('RAMDatabase: putDirectory(): create directory.');

      /* Verify parent do exists */
      let currentParent: type.Directory | type.Stash;

      if (this.store.fileTree.hasOwnProperty(data.parent))
        currentParent = this.store.fileTree[data.parent] as type.Directory;
      else currentParent = this.store.stashes[data.parent];

      /* Add directory to parent linked list */
      dataDirectory.next = currentParent.child;
      currentParent.child = dataDirectory.id;
    }

    this.store.fileTree[dataDirectory.id] = dataDirectory;
    res.data = {
      id: RequestError.NONE,
      success: true,
      message: 'Put request success.',
    };

    return null as any;
  }

  /**
   * Retreive directory from the database
   * @param {string} userId
   * @param {DirectoryPacket} res
   * @return {Error | null}
   */
  getDirectory(directoryId: string, res: type.DirectoryPacket): Error {
    logger.write.info(`RAMDatabase: getDirectory(): directory ${directoryId}.`);

    if (this.store.fileTree.hasOwnProperty(directoryId)) {
      logger.write.debug(`RAMDatabase: getDirectory(): directory found.`);

      const resultArr: type.ModelFile[] = [];

      const data: type.ModelFile = this.store.fileTree[directoryId];
      let dataDir: type.Directory;

      if (util.instanceOf(type.DirectoryPropsKey, data))
        dataDir = data as type.Directory;
      else {
        res.data = null as any;
        return null as any;
      }

      let root: string = dataDir.child;

      while (root !== '\0') {
        if (this.store.fileTree.hasOwnProperty(root)) {
          resultArr.push(this.store.fileTree[root]);
          const nextDirectory: type.ModelFile = this.store.fileTree[root];
          root = nextDirectory.next;
        } else {
          return new Error(
            'Internal error detected: child id does not exists.'
          );
        }
      }

      res.data = resultArr;
    } else {
      logger.write.debug(`RAMDatabase: getDirectory(): directory found.`);
    }

    return null as any;
  }

  verifyFileEntry(data: type.FileEntry, res: ResponsePacket): Error {
    /* Check if the conversion is successful */
    if (data === null) {
      res.data = {
        id: RequestError.INVALID_DIRECTORY,
        success: false,
        message: 'Request error: invalid file object.',
      };
      return null as any;
    }

    /* If the directory has last version */
    if (Object.prototype.hasOwnProperty.call(this.store.fileTree, data.id)) {
      const currentFileTree: type.ModelFile = this.store.fileTree[data.id];

      /* Verify that the owner, the stash, and the parent are the same. */
      if (
        currentFileTree.stash != data.stash ||
        currentFileTree.owner != data.owner ||
        currentFileTree.parent != data.parent
      ) {
        res.data = {
          id: RequestError.UNAUTHORIZED_CHANGE,
          success: false,
          message: 'Request error: unauthorized changes of file.',
        };
        return null as any;
      }

      /* Verify version descendant */
      if (!util.isNextVersion(currentFileTree, data)) {
        /* Security: do not return version number */
        res.data = {
          id: RequestError.INVALID_VERSION,
          success: false,
          message: 'Request error: version provided out of order',
        };
        return null as any;
      }

      /* Verify parent's existence */
      if (
        !Object.prototype.hasOwnProperty.call(
          this.store.fileTree,
          currentFileTree.parent
        ) ||
        Object.prototype.hasOwnProperty.call(
          this.store.stashes,
          currentFileTree.parent
        )
      )
        return new Error(
          "Internal error detected: original file's parent has not been " +
            'created.'
        );
    } else {
      /* Verify parent do exists */
      if (
        !this.store.fileTree.hasOwnProperty(data.parent) &&
        !this.store.stashes.hasOwnProperty(data.parent)
      ) {
        res.data = {
          id: RequestError.INVALID_DIRECTORY,
          success: false,
          message: `Request error: file parent ${data.parent} does not exists.`,
        };
        return null as any;
      }
    }

    res.data = {id: RequestError.NONE, success: true, message: ''};

    return null as any;
  }

  /**
   * Write file to the database
   * @param {any} data
   * @param {ResponsePacket} res
   * @return {Error | null}
   */
  putFileEntry(data: any, res: ResponsePacket): Error {
    const dataFileEntry: type.FileEntry = util.convertToMod(
      type.FileEntryPropsKey,
      data
    ) as type.FileEntry;

    logger.write.info(`RAMDatabase: putFileEntry(): file ${data.id}.`);

    const error: Error = this.verifyFileEntry(dataFileEntry, res);

    if (error !== null) return error;
    else if (!res.data.success) return null as any;

    /* Check if the directory has been created */
    if (
      Object.prototype.hasOwnProperty.call(
        this.store.fileTree,
        dataFileEntry.id
      )
    ) {
      logger.write.debug('RAMDatabase: putFileEntry(): update file.');
    } else {
      logger.write.debug('RAMDatabase: putFileEntry(): create file.');

      /* Verify parent do exists */
      let currentParent: type.Directory | type.Stash;

      if (this.store.fileTree.hasOwnProperty(data.parent))
        currentParent = this.store.fileTree[data.parent] as type.Directory;
      else currentParent = this.store.stashes[data.parent];

      /* Add directory to parent linked list */
      dataFileEntry.next = currentParent.child;
      currentParent.child = dataFileEntry.id;
    }

    this.store.fileTree[dataFileEntry.id] = dataFileEntry;
    res.data = {
      id: RequestError.NONE,
      success: true,
      message: 'Put file success.'
    };

    return null as any;
  }

  /**
   * Retreive stash from the database
   * @param {string} userId
   * @param {FileEntryPacket} res
   * @return {Error | null}
   */
  getFileEntry(fileEntryId: string, res: type.FileEntryPacket): Error {
    logger.write.info(`RAMDatabase: getFileEntry(): file ${fileEntryId}.`);

    if (Object.prototype.hasOwnProperty.call(this.store.fileTree, fileEntryId)) {
      const candidateFile: type.ModelFile = this.store.fileTree[fileEntryId];

      if (util.instanceOf(type.FileEntryPropsKey, candidateFile)) {
        res.data = candidateFile as type.FileEntry;
        return null as any;
      }
    }
    return null as any;
  }
}
