import express from 'express';
import {ResponsePacket, User} from '../model/struct';
import {getUser, putUser} from '../model/model';
import {sendClientUser, sendClientResult} from '../messenger/index';

let router = express.Router();

router.get('/:id', (req, res) => {
    let error;

    /* Check if the params query is valid */
    if (isNaN(req.params.id))
    {
        res.end(400);
        return;
    }

    /* Retrieve user object from database */
    let userObj: ResponsePacket = {};
    error = getUser(BigInt(req.params.id), userObj);

    if (error != null)
    {
        res.end(500);
        return;
    }

    /* Send user data back to client */
    sendClientUser(
        userObj.packetUser,
        res
    );

    res.end();
});

router.put('/create', (req, res) => {
    let error;

    /* Check if the params query is valid */
    if (isNaN(req.params.id))
    {
        res.end(400);
        return;
    }

    /* Put user object to database */
    let result: ResponsePacket = {};
    error = putUser(req.body, result);

    if (error != null)
    {
        res.end(500);
        return;
    }

    /* Send user data back to client */
    sendClientResult(
        result.packetResult,
        res
    );

    res.end();
});

router.put('/update', (req, res) => {
    let error;

    /* Check if the params query is valid */
    if (isNaN(req.params.id))
    {
        res.end(400);
        return;
    }

    /* Put user object to database */
    let result: ResponsePacket = {};
    error = putUser(req.body, result);

    if (error != null)
    {
        res.end(500);
        return;
    }

    /* Send user data back to client */
    sendClientResult(
        result.packetResult,
        res
    );

    res.end();
});

export const UserRouter = router;