/**
 * controller/struct.ts stores the interface used specifically for response
 */
export interface ResponsePacket {
  data: RequestResult; // True if the change, such as put and delete, are succesful
}

export interface RequestResult {
  id: number;
  success: boolean;
  message: string;
}

export enum RequestError {
  NONE,
  INVALID_USER,
  INVALID_INVENTORY,
  INVALID_STASH,
  INVALID_DIRECTORY,
  INVALID_FILE_ENTRY,
  INVALID_VERSION,
  UNAUTHORIZED_CHANGE,
}
