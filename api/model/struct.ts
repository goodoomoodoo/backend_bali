/**
 * struct.ts stores the database tables or schema
 */

export interface ResponsePacket {
    packetUser?: User;
    packetStash?: Stash;
    packetDirectory?: Directory;
    packetFileEntry?: FileEntry;
    packetResult?: boolean;             // Not part of the schema
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