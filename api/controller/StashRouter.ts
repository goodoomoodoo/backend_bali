import express from 'express';
import {DirectoryPacket, FileEntryPacket} from '../model/type';
import {ResponsePacket} from './struct';
import {dbDistributor} from '../model/model';
import {
  sendClientStash,
  sendClientResult,
  sendClientDirectory,
  sendClientFileEntry,
} from '../messenger/index';
import {logger} from '../../index';

const router = express.Router();

router.get('/:id', (req, res) => {
  let error;

  /* Retrieve stash tuple from database */
  const packet: DirectoryPacket = {} as DirectoryPacket;
  error = dbDistributor.getStash(req.params.id, packet);

  if (error !== null) {
    logger.write.error(error.message);
    res.sendStatus(500);
    res.end();
    return;
  }

  /* Send user data back to client */
  sendClientDirectory(packet.data, res);

  res.end();
});

router.put('/', (req, res) => {
  let error;

  /* Put stash tuple to database */
  const result: ResponsePacket = {} as ResponsePacket;
  error = dbDistributor.putStash(req.body, result);

  if (error !== null) {
    logger.write.error(error.message);
    res.sendStatus(500);
    res.end();
    return;
  }

  /* Send user data back to client */
  sendClientResult(result.data, res);

  res.end();
});

router.get('/directory/:id', (req, res) => {
  let error;

  const packet: DirectoryPacket = {} as DirectoryPacket;
  error = dbDistributor.getDirectory(req.params.id, packet);

  if (error !== null) {
    logger.write.error(error.message);
    res.sendStatus(500);
    res.end();
    return;
  }

  sendClientDirectory(packet.data, res);

  res.end();
})

router.put('/directory/', (req, res) => {
  let error;

  const result: ResponsePacket = {} as ResponsePacket;
  error = dbDistributor.putDirectory(req.body, result);

  if (error !== null) {
    logger.write.error(error.message);
    res.sendStatus(500);
    res.end();
    return;
  }

  /* Send user data back to client */
  sendClientResult(result.data, res);

  res.end();
});

router.get('/file/:id', (req, res) => {
  let error;

  const packet: FileEntryPacket = {} as FileEntryPacket;
  error = dbDistributor.getFileEntry(req.params.id, packet);

  if (error !== null) {
    logger.write.error(error.message);
    res.sendStatus(500);
    res.end();
    return;
  }

  sendClientFileEntry(packet.data, res);

  res.end();
});

router.put('/file/', (req, res) => {
  let error;

  const result: ResponsePacket = {} as ResponsePacket;
  error = dbDistributor.putFileEntry(req.body, result);

  if (error !== null) {
    logger.write.error(error.message);
    res.sendStatus(500);
    res.end();
    return;
  }

  sendClientResult(result.data, res);

  res.end();
})

export const StashRouter = router;
