/**
 * struct.ts stores the database tables or schema
 *
 * Note: version number always starts at 1, sent by client.
 */

export interface UserPacket {
  data: User;
}

export interface StashPacket {
  data: Stash;
}

export interface DirectoryPacket {
  data: Directory;
}

export interface FileEntryPacket {
  data: FileEntry;
}

export interface ChangeResultPacket {
  data: boolean; // True if the change, such as put and delete, are succesful
}

/**
 * User table
 */
export interface User {
  id: string; // Primary Key
  firstName: string;
  lastName: string;
  email: string;
  version: number;
}

/**
 * Stash table
 * Stash are own by users, and each stash should store a files and directories
 */
export interface Stash {
  id: string; // Primary Key
  owner: string; // User.id Foreign Key, cascade delete
  name: string;
  createdDate: string;
  version: number;
}

/**
 * Directory table
 * Directory stores the files and sub directory
 */
export interface Directory {
  id: string; // Primary Key
  owner: string; // User.id Foreign Key, cascade delete
  stash: string; // Stash.id Foreign Key, cascade delete
  name: string;
  createdDate: string;
  timestamp: string;
  version: number;
}

/**
 * FileEntry table
 */
export interface FileEntry {
  id: string; // Primary Key
  owner: string; // Directory.id Foreign Key, cascade delete
  directory: string; // Directory.id Foreign Key, cascade delete
  name: string;
  content: string;
  createdDate: string;
  timestamp: string;
  version: number;
}
