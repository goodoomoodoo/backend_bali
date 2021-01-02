/**
 * sturct.js stores the local store structure
 */

import {Stash, User, Inventory, Model, ModelFile} from '../../model/type';

export interface Store {
  users: UserStore;
  inventories: InventoryStore;
  stashes: StashStore;
  fileTree: treeStore;
}

export interface ModelStore<T extends Model> {
  [hash: string]: T;
}

/* User table */
export type UserStore = ModelStore<User>;

/* Inventory table */
export type InventoryStore = ModelStore<Inventory>;

/* Stash table */
export type StashStore = ModelStore<Stash>;

/* File Tree table */
export type treeStore = ModelStore<ModelFile>;
