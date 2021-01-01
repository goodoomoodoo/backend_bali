/**
 * store.ts stores the general function to access the store data
 *
 * Note: the put subroutine can be refractored into a function to shorten the
 * code.
 */
import {logger} from '../../../index';
import Database from '../database';
import * as mod from '../../model/struct';
import {ResponsePacket, RequestError} from '../../controller/struct';
import {Store, ModelStore, StashStore, treeStore} from './struct';

/**
 * Store Iterator
 */
class StoreIterator<T extends mod.Model, W extends ModelStore<T>> {
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
      let value: T = this.root;
      this.root = this.store[value.next];
      return value;
    } else {
      return null as any;
    }
  }

  hasNext(): boolean {
    return this.root !== undefined;
  }

  end(): any {
    return undefined;
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
   * Convert the data into the provided props key
   * @param {string[]} keys
   * @param {any} data
   * @return {any}
   */
  convertToMod(keys: string[], data: mod.Model): mod.Model {
    const newObj: mod.Model = {} as mod.Model;

    for (const key of keys) {
      if (!Object.prototype.hasOwnProperty.call(data, key)) return null as any;
      else newObj[key] = data[key];
    }

    return newObj;
  }

  /**
   * Write user to the database
   * @param {any} data
   * @param {ResponsePacket} res
   * @return {Error | null}
   */
  putUser(data: any, res: ResponsePacket): Error {
    const dataUser: mod.User = this.convertToMod(
      mod.UserPropsKey,
      data
    ) as mod.User;

    /* If dataUser is null, meaning the data sent is invalid */
    if (dataUser === null) {
      res.data = {
        id: RequestError.INVALID_USER,
        success: false,
        message: 'Request error: invalid user object.',
      };
      return null as any;
    }

    logger.write.info(`RAMDatabase: putUser(): user ${data.id}.`);

    /* Check if the user id exists already */
    if (Object.prototype.hasOwnProperty.call(this.store.users, data.id)) {
      const currentUser: mod.User = this.store.users[data.id];
      const versionGap: number = data.version - currentUser.version;

      /* Make sure the next coming version should have 1 exact increment */
      if (versionGap != 1) {
        res.data = {
          id: RequestError.INVALID_VERSION,
          success: false,
          /* For security reason, the error message will not expose the current
          version. */
          message: 'Request error: version provided out of order',
        };
        return null as any;
      }

      /* This will not work if two users happen to have same id and same
      version, which is very unlikely. */
    } else {
      /* Create new user and inventory, check if the inventory exists */
      if (
        !Object.prototype.hasOwnProperty.call(
          this.store.inventories,
          dataUser.inventory
        )
      ) {
        this.store.inventories[dataUser.inventory] = {
          id: dataUser.inventory,
          owner: dataUser.id,
          stashRoot: '\0',
          version: 1,
        };
      } else {
        res.data = {
          id: RequestError.INVALID_INVENTORY,
          success: false,
          message: 'Request error: inventory already exists.',
        };

        return null as any;
      }
    }

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
  getUser(userId: string, res: mod.UserPacket): Error {
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
   * Write stash to the database
   * @param {any} data
   * @param {ResponsePacket} res
   * @return {Error | null}
   */
  putStash(data: any, res: ResponsePacket): Error {
    const dataStash: mod.Stash = this.convertToMod(
      mod.StashPropsKey,
      data
    ) as mod.Stash;

    /* If dataUser is null, meaning the data sent is invalid */
    if (dataStash === null) {
      res.data = {
        id: RequestError.INVALID_STASH,
        success: false,
        message: 'Request error: invalid stash object.',
      };
      return null as any;
    }

    logger.write.info(`RAMDatabase: putStash(): stash ${data.id}.`);

    /* Check if the stash id exists already */
    if (
      Object.prototype.hasOwnProperty.call(this.store.stashes, dataStash.id)
    ) {
      const currentStash: mod.Stash = this.store.stashes[dataStash.id];
      const versionGap: number = data.version - currentStash.version;

      /* Make sure the next coming version should have 1 exact increment */
      if (versionGap != 1) {
        res.data = {
          id: RequestError.INVALID_VERSION,
          success: false,
          /* For security reason, the error message will not expose the current
          version. */
          message: 'Request error: stash version provided out of order.',
        };
        return null as any;
      }

      /* Make sure the change request is submitted by the owner */
      if (currentStash.owner != dataStash.owner) {
        res.data = {
          id: RequestError.UNAUTHORIZED_CHANGE,
          success: false,
          message: 'Request error: stash can only be changed by owner.',
        };
        return null as any;
      }

      /* If all check passes, update the pointer */
      dataStash.next = currentStash.next;

      /* This will not work if two stashes happen to have same id, same owner,
      and same version, which is very unlikely. */
    } else {
      logger.write.info('RAMDatabase: putStash(): add stash to inventory.');

      /* Find the inventory the user owns */
      const currentUser: mod.User = this.store.users[dataStash.owner];
      const currentInventory: mod.Inventory = this.store.inventories[
        currentUser.inventory
      ];

      /* Inver the stash ID to the linked list */
      if (currentInventory.stashRoot !== '\0') {
        if (
          !Object.prototype.hasOwnProperty.call(
            this.store.stashes,
            currentInventory.stashRoot
          )
        ) {
          return new Error('RAMDatabase: putStash(): root stash not found.');
        }

        const stashRoot: mod.Stash = this.store.stashes[
          currentInventory.stashRoot
        ];
        dataStash.next = stashRoot.next;
        stashRoot.next = dataStash.id;
        this.store.stashes[currentInventory.stashRoot] = stashRoot;
      } else {
        currentInventory.stashRoot = dataStash.id;
        this.store.inventories[currentInventory.id] = currentInventory;
      }

      logger.write.debug(
        `RAMDatabase: putStash(): stash table ${currentInventory.stashRoot}`
      );
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
  getStash(stashId: string, res: mod.DirectoryPacket): Error {
    logger.write.info(`RAMDatabase: getStash(): stash ${stashId}.`);

    if (Object.prototype.hasOwnProperty.call(this.store.stashes, stashId)) {
      logger.write.info('RAMDatabase: getStash(): iterating file tree.');

      const resultArr: mod.ModelItem[] = [];
      const dataStash: mod.Stash = this.store.stashes[stashId];
      let root: string = dataStash.child;
      let storeItr: StoreIterator<mod.ModelItem, treeStore> = new StoreIterator(this.store.fileTree);
      storeItr.begin(root);

      while (storeItr.hasNext()) {
        if (this.store.fileTree.hasOwnProperty(root)) {
          resultArr.push(this.store.fileTree[root]);
          let nextDirectory: mod.ModelFile = this.store.fileTree[root];
          root = nextDirectory.next;
        } else {
          return new Error(
            'Internal error detected: child id does not exists.'
          );
        }
      }

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
  getInventory(userId: string, res: mod.StashPacket): Error {
    if (Object.prototype.hasOwnProperty.call(this.store.users, userId)) {
      logger.write.info(`RAMDatabase: getInventory(): user's stash ${userId}.`);

      const currentUser: mod.User = this.store.users[userId];

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
      const currentInventory: mod.Inventory = this.store.inventories[
        currentUser.inventory
      ];

      /* Get all hashes of the stash ID */
      let stashRoot: string = currentInventory.stashRoot;
      const stashList: mod.Stash[] = [];

      while (stashRoot !== '\0') {
        logger.write.debug(`RAMDatabase: getInventory(): stashId ${stashRoot}`);

        /* Make sure the stash ID created do exists */
        if (!this.store.stashes.hasOwnProperty(stashRoot)) {
          return new Error('Internal error detected: stash not created.');
        }

        const currentStash: mod.Stash = this.store.stashes[stashRoot];
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
   * Write directory to the database
   * @param {any} data
   * @param {ResponsePacket} res
   * @return {Error | null}
   */
  putDirectory(data: any, res: ResponsePacket): Error {
    const dataDirectory: mod.Directory = this.convertToMod(
      mod.DirectoryPropsKey,
      data
    ) as mod.Directory;

    /* Check if the requested data object is convertable to Directory */
    if (dataDirectory === null) {
      res.data = {
        id: RequestError.INVALID_DIRECTORY,
        success: false,
        message: 'Request error: invalid directory object.',
      };
      return null as any;
    }

    logger.write.info(`RAMDatabase: putDirectory(): directory ${data.id}.`);

    /* Check if the directory has been created */
    if (
      Object.prototype.hasOwnProperty.call(
        this.store.fileTree,
        dataDirectory.id
      )
    ) {
      logger.write.debug('RAMDatabase: putDirectory(): update directory.');

      const currentFileTree: mod.ModelFile = this.store.fileTree[
        dataDirectory.id
      ];
      /* Verify that the owner, the stash, and the parent are the same. */
      if (
        currentFileTree.stash != dataDirectory.stash ||
        currentFileTree.owner != dataDirectory.owner ||
        currentFileTree.parent != dataDirectory.parent
      ) {
        res.data = {
          id: RequestError.UNAUTHORIZED_CHANGE,
          success: false,
          message: 'Request error: unauthorized changes of directory.',
        };
        return null as any;
      }

      /* TODO: Verify version */

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

      /* Verify that current parent do have a child of this directory id. */
      let currentParent: mod.Directory | mod.Stash;

      if (this.store.fileTree.hasOwnProperty(currentFileTree.parent))
        currentParent = this.store.fileTree[currentFileTree.parent] as mod.Directory;
      else if (this.store.stashes.hasOwnProperty(currentFileTree.parent))
        currentParent = this.store.stashes[currentFileTree.parent];
      else
        return new Error(
          'Internal error detected: invalid parent of directory.'
        );

      let root: string = currentParent.child;
      let found = false;

      while (root !== '\0') {
        if (root == currentFileTree.id) {
          found = true;
          break;
        } else if (this.store.fileTree.hasOwnProperty(root)) {
          const nextDirectory: mod.ModelFile = this.store.fileTree[root];
          root = nextDirectory.id;
        } else {
          return new Error(
            'Internal error detected: malformed parent directory.'
          );
        }
      }
    } else {
      logger.write.debug('RAMDatabase: putDirectory(): create directory.');

      /* Verify parent do exists */
      let currentParent: mod.Directory | mod.Stash;

      if (this.store.fileTree.hasOwnProperty(dataDirectory.parent))
        currentParent = this.store.fileTree[dataDirectory.parent] as mod.Directory;
      else if (this.store.stashes.hasOwnProperty(dataDirectory.parent))
        currentParent = this.store.stashes[dataDirectory.parent];
      else {
        res.data = {
          id: RequestError.INVALID_DIRECTORY,
          success: false,
          message: 'Request error: directory parent does not exists.',
        };
        return null as any;
      }

      /* Verify this directory has yet to be added */
      let root: string = currentParent.child;

      while (root !== '\0') {
        if (root == dataDirectory.id) {
          res.data = {
            id: RequestError.INVALID_DIRECTORY,
            success: false,
            message: 'Request error: directory already existed.',
          };
          break;
        } else if (this.store.fileTree.hasOwnProperty(root)) {
          const nextDirectory: mod.ModelFile = this.store.fileTree[root];
          root = nextDirectory.next;
        } else {
          return new Error(
            'Internal error detected: malformed parent directory.'
          );
        }
      }

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
  getDirectory(directoryId: string, res: mod.DirectoryPacket): Error {
    if (this.store.fileTree.hasOwnProperty(directoryId)) {
      const resultArr: mod.ModelItem[] = [];

      const data: mod.ModelFile = this.store.fileTree[directoryId];
      let dataDir: mod.Directory;

      if (mod.instanceOf(mod.DirectoryPropsKey, data))
        dataDir = data as mod.Directory;
      else {
        res.data = null as any;
        return null as any;
      }

      let root: string = dataDir.child;

      while (root !== '\0') {
        if (this.store.fileTree.hasOwnProperty(root)) {
          resultArr.push(this.store.fileTree[root]);
          let nextDirectory: mod.ModelFile = this.store.fileTree[root];
          root = nextDirectory.next;
        } else {
          return new Error(
            'Internal error detected: child id does not exists.'
          );
        }
      }

      res.data = resultArr;
    }

    return null as any;
  }

  /**
   * Write file to the database
   * @param {any} data
   * @param {ResponsePacket} res
   * @return {Error | null}
   */
  putFileEntry(data: any, res: ResponsePacket): Error {
    return null as any;
  }

  /**
   * Retreive stash from the database
   * @param {string} userId
   * @param {FileEntryPacket} res
   * @return {Error | null}
   */
  getFileEntry(fileEntryId: string, res: mod.FileEntryPacket): Error {
    return null as any;
  }
}
