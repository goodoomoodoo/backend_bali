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

export interface UserStore extends ModelStore<User>{}

export interface InventoryStore extends ModelStore<Inventory>{}

export interface StashStore extends ModelStore<Stash> {}

export interface treeStore extends ModelStore<ModelFile>{}