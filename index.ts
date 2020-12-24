import fs from 'fs';
import yargs from 'yargs';
import yaml from 'js-yaml';

import {LoggerWrapper} from './winston/logger';

const argv: any = yargs(process.argv).option('init', {
  demandOption: true,
  type: 'string',
  description: 'Server configuration file',
}).argv;

/* Check if the given configuration file exists */
let config: any;
if (fs.existsSync(argv.init))
  config = yaml.safeLoad(fs.readFileSync(argv.init).toString());

/* Write environment variable */
process.env.NODE_ENV = config.mode + ' ' + config.branch;
process.env.PORT = config.server.port;

export const logger = new LoggerWrapper(
  config.log.level,
  config.mode,
  config.log.timeformat
);

logger.write.info('Logger created.');

/* Initiate server */
import {init} from './server';

init();
