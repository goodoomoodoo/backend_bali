/**
 * sturct.js stores the local store structure
 */

import {Stash, User, Inventory, Model, ModelFile} from '../../model/struct';

export interface Store {
  users: UserStore;
  inventories: InventoryStore;
  stashes: StashStore;
  fileTree: treeStore;
}

export interface ModelStore<T extends Model> {
  [hash: string]: T;
}

export type UserStore = ModelStore<User>;

export type InventoryStore = ModelStore<Inventory>;

export type StashStore = ModelStore<Stash>;

export type treeStore = ModelStore<ModelFile>;
