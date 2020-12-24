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
    id: bigint;             // Primary Key
    firstName: string;
    lastName: string;
    email: string;
}

/**
 * Stash table
 * Stash are own by users, and each stash should store a files and directories
 */
export interface Stash {
    id: bigint;            // Primary Key
    owner: bigint;         // User.id Foreign Key, cascade delete
    name: string;
    createdDate: string;
}

/**
 * Directory table
 * Directory stores the files and sub directory
 */
export interface Directory {
    id: bigint;             // Primary Key
    owner: bigint;          // User.id Foreign Key, cascade delete
    stash: bigint;          // Stash.id Foreign Key, cascade delete
    name: string;
    createdDate: string;
    timestamp: string;
}

/**
 * FileEntry table
 */
export interface FileEntry {
    id: bigint;             // Primary Key
    owner: bigint;          // Directory.id Foreign Key, cascade delete
    directory: bigint;      // Directory.id Foreign Key, cascade delete
    name: string;
    content: string;
    createdDate: string;
    timestamp: string;
}