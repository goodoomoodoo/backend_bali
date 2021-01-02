import {User, Stash, Directory, FileEntry, ModelItem} from '../model/type';
import {RequestResult} from '../controller/struct';
import {Response} from 'express';
import {logger} from '../../index';

export function sendClientResult(data: RequestResult, res: Response) {
  logger.write.debug('Sending request result.');
  res.send(JSON.stringify(data));
}

export function sendClientUser(data: User, res: Response) {
  logger.write.debug('Sending requested user.');

  if (data === null) {
    res.sendStatus(404);
    return;
  }

  res.send(JSON.stringify(data));
}

export function sendClientStash(data: Stash[], res: Response) {
  logger.write.debug('Sending requested stashes.');

  if (data === null) {
    res.sendStatus(404);
    return;
  }

  res.send(JSON.stringify(data));
}

export function sendClientDirectory(data: ModelItem[], res: Response) {
  logger.write.debug('Sending requested directory.');

  if (data === null) {
    res.sendStatus(404);
    return;
  }

  res.send(JSON.stringify(data));
}

export function sendClientFileEntry(data: FileEntry[], res: Response) {
  logger.write.debug('Sending requested files.');

  if (data === null) {
    res.sendStatus(404);
    return;
  }

  res.send(JSON.stringify(data));
}
