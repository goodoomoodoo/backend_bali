/**
 * type.ts stores the model interfaces.
 */
export interface DBObject {
  [hash: string]: number | string;
}

export interface UserPacket {
  data: User;
}

export interface StashPacket {
  data: Stash[];
}

export interface DirectoryPacket {
  data: ModelFile[];
}

export interface FileEntryPacket {
  data: FileEntry;
}

export interface Model extends DBObject {
  id: string; // Primary Key
  version: number;
}

export interface ModelItem extends Model {
  owner: string; // User.id Foreign Key, cascade delete
}

export interface ModelFile extends ModelItem {
  parent: string; // Stash.id | Directory.id Foriegn Key, cascade on delete
  next: string; // ModelFile.id Recursive Foriegn Key
  timestamp: string;
}

/**
 * User table
 */
export interface User extends Model {
  inventory: string; // Inventory.id Foreign Key
  firstName: string;
  lastName: string;
  email: string;
}

export const UserPropsKey: string[] = [
  'id',
  'inventory',
  'firstName',
  'lastName',
  'email',
  'version',
];

/**
 * Inventory table
 * Inventory distinct to each user that stores all stashes own the user
 */
export interface Inventory extends ModelItem {
  stashRoot: string; // Stash.id Foreign Key
}

export const InventoryPropsKey: string[] = [
  'id',
  'owner',
  'stashRoot',
  'version',
];

/**
 * Stash table
 * Stash are own by users, and each stash should store a files and directories
 */
export interface Stash extends ModelItem {
  next: string; // Stash.id Recursive Foreign Key
  child: string; // Directory.id | FileEntry.id Foreign Key
  name: string;
  createdDate: string;
}

export const StashPropsKey: string[] = [
  'id',
  'owner',
  'next',
  'child',
  'name',
  'createdDate',
  'version',
];

/**
 * Directory table
 * Directory stores the files and sub directory
 */
export interface Directory extends ModelFile {
  stash: string; // Stash.id Foreign Key, cascade delete
  child: string; // Directory.id | FileEntry.id Recursive Foreign Key
  name: string;
  createdDate: string;
}

export const DirectoryPropsKey: string[] = [
  'id',
  'owner',
  'stash',
  'parent',
  'child',
  'next',
  'name',
  'createdDate',
  'timestamp',
  'version',
];

/**
 * FileEntry table
 */
export interface FileEntry extends ModelFile {
  stash: string; // Stash.id Foreign Key, cascade delete
  name: string;
  content: string;
  createdDate: string;
}

export const FileEntryPropsKey: string[] = [
  'id',
  'owner',
  'stash',
  'parent',
  'next',
  'name',
  'content',
  'createdDate',
  'timestamp',
  'version',
];
