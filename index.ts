import express from "express";
import {Application} from "express";
import * as fs from "fs";
import morgan from "morgan";
import yaml from "js-yaml";

import Logger from "./winston/winston";

/* yargs doesn't support typescript yet */
import yargs from "yargs/yargs";

/* Import the routers */
import {UserRouter} from './api/controller/UserRouter';

/* Root Web Server */
const App: Application = express();

/* Parse command line argument */
const argv = yargs(process.argv)
    .options({
        init: {
            demandOption: true,
            type: 'string'
        }
    }).argv;

/* Parse configuration file */
var config;

if (fs.existsSync(argv.init))
{
    config = yaml.safeLoad(fs.readFileSync(argv.init));
}
else
{  
    throw Error("command line error: filename does not exists: --init <filename>");
}

/* Logger */
export const logger = new Logger(
    config.log.level,
    config.env,
    config.log["time format"]
);

logger.write.info("Logger created.");

/* Setup middleware */
App.use(morgan('tiny'));    // Logs HTTP requests and responses
App.use(express.json());
App.use(express.urlencoded({extended: true}));

logger.write.info("Middleware mounted.");

/* Setup routes */
App.use("users", UserRouter);

/* Serve port */
App.listen(config.server.port, () => {
    logger.write.info(`Serving on localhost:${config.server.port}.`);
})