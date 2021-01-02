import express from 'express';
import {UserPacket, StashPacket} from '../model/type';
import {ResponsePacket} from './struct';
import {dbDistributor} from '../model/model';
import {
  sendClientUser,
  sendClientResult,
  sendClientStash,
} from '../messenger/index';
import {logger} from '../../index';

const router = express.Router();

router.get('/:id', (req, res) => {
  let error;

  /* Retrieve user object from database */
  const userObj: UserPacket = {} as UserPacket;
  error = dbDistributor.getUser(req.params.id, userObj);

  if (error !== null) {
    logger.write.error(error.message);
    res.sendStatus(500);
    res.end();
    return;
  }

  /* Send user data back to client */
  sendClientUser(userObj.data, res);

  res.end();
});

router.put('/', (req, res) => {
  let error;

  /* Put user object to database */
  const result: ResponsePacket = {} as ResponsePacket;
  error = dbDistributor.putUser(req.body, result);

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

router.get('/inventory/:id', (req, res) => {
  let error;

  /* Retrieve user object from database */
  const stashObj: StashPacket = {} as StashPacket;
  error = dbDistributor.getInventory(req.params.id, stashObj);

  if (error !== null) {
    logger.write.error(error.message);
    res.sendStatus(500);
    res.end();
    return;
  }

  /* Send user data back to client */
  sendClientStash(stashObj.data, res);

  res.end();
});

export const UserRouter = router;
