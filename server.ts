import express, {Application} from 'express';
import {logger} from './index';
import morgan from 'morgan';

/* Import the routers */
import {UserRouter} from './api/controller/UserRouter';

export const init = () => {
  /* Root Web Server */
  const App: Application = express();

  /* Setup middleware */
  App.use(morgan('combined', {stream: logger.stream()}));
  App.use(express.json());
  App.use(express.urlencoded({extended: true}));

  logger.write.info('Middleware mounted.');

  /* Setup routes */
  App.use('/users', UserRouter);

  /* Serve port */
  App.listen(process.env.PORT, () => {
    logger.write.info(`Serving on localhost:${process.env.PORT}.`);
  });
};
