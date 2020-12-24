import express from 'express';
import {UserPacket, ChangeResultPacket} from '../model/struct';
import {dbDistributor} from '../model/model';
import {sendClientUser, sendClientResult} from '../messenger/index';

const router = express.Router();

router.get('/:id', (req, res) => {
  let error;

  /* Check if the params query is valid */
  if (isNaN(parseInt(req.params.id))) {
    res.end(400);
    return;
  }

  /* Retrieve user object from database */
  const userObj: UserPacket = {} as UserPacket;
  error = dbDistributor.getUser(req.params.id, userObj);

  if (error !== null) {
    res.end(500);
    return;
  }

  /* Send user data back to client */
  sendClientUser(userObj.data, res);

  res.end();
});

router.put('/', (req, res) => {
  let error;

  /* Put user object to database */
  const result: ChangeResultPacket = {} as ChangeResultPacket;
  error = dbDistributor.putUser(req.body, result);

  if (error !== null) {
    res.end(500);
    return;
  }

  /* Send user data back to client */
  sendClientResult(result.data, res);

  res.end();
});

export const UserRouter = router;
