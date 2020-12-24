import {User, Stash, Directory, FileEntry} from '../model/struct';
import {Response} from 'express';

export function sendClientResult(result: boolean, res: Response) {
  const data = {success: result};
  res.send(JSON.stringify(data));
}

export function sendClientUser(data: User, res: Response) {
  if (data === null) {
    res.sendStatus(404);
    return;
  }

  res.send(JSON.stringify(data));
}

export function sendClientStash(data: Stash, res: Response) {
  if (data === null) {
    res.sendStatus(404);
    return;
  }

  res.send(JSON.stringify(data));
}

export function sendClientDirectory(data: Directory, res: Response) {
  if (data === null) {
    res.sendStatus(404);
    return;
  }

  res.send(JSON.stringify(data));
}

export function sendClientFileEntry(data: FileEntry, res: Response) {
  if (data === null) {
    res.sendStatus(404);
    return;
  }

  res.send(JSON.stringify(data));
}
