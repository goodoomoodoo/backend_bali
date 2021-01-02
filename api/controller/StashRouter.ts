import express from 'express';
import {DirectoryPacket, StashPacket} from '../model/type';
import {ResponsePacket} from './struct';
import {dbDistributor} from '../model/model';
import {
  sendClientStash,
  sendClientResult,
  sendClientDirectory,
} from '../messenger/index';
import {logger} from '../../index';

const router = express.Router();

router.get('/:id', (req, res) => {
  let error;

  /* Retrieve user object from database */
  const stashObj: DirectoryPacket = {} as DirectoryPacket;
  error = dbDistributor.getStash(req.params.id, stashObj);

  if (error !== null) {
    logger.write.error(error.message);
    res.sendStatus(500);
    res.end();
    return;
  }

  /* Send user data back to client */
  sendClientDirectory(stashObj.data, res);

  res.end();
});

router.put('/', (req, res) => {
  let error;

  /* Put user object to database */
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

router.put('/directory/', (req, res) => {
  let error;

  /* Retrieve user object from database */
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

export const StashRouter = router;
