/**
 * model.ts
 * The model of the bali server. This is the model that will be call by 
 * handlers and it will not be interacting with the database directory. Instead
 * there will be database modules to interact with database that reinforces the 
 * models.
 */

import './struct';
import { User, Stash, Directory, FileEntry, ResponsePacket } from './struct';


/******************************************************************************
 * 
 * User table
 * 
 ******************************************************************************/

export function putUser(newUser: User, res: ResponsePacket): Error {
    return null;
}

export function getUser(userId: bigint, res: ResponsePacket): Error {
    return null;
}

/******************************************************************************
 * 
 * Stash table
 * 
 ******************************************************************************/

export function putStash(newStash: Stash, res: ResponsePacket): Error {
    return null;
}

export function getStash(stashId: bigint): Stash {
    return null;
}

/******************************************************************************
 * 
 * Directory table
 * 
 ******************************************************************************/

export function putDirectory(newDirectory: Directory, res: ResponsePacket): Error {
    return null;
}

export function getDirectory(directoryId: bigint, res: ResponsePacket): Error {
    return null;
}

/******************************************************************************
 * 
 * FileEntry table
 * 
 ******************************************************************************/

export function putFileEntry(newFileEntry: FileEntry, res: ResponsePacket): Error {
    return null;
}

export function getFileEntry(fileEntryId: bigint, res: ResponsePacket): Error {
    return null;
}