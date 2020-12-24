import winston from 'winston';

export class LoggerWrapper {
  write: winston.Logger;

  constructor(level: string, env: string, timeFmt: string) {
    this.write = winston.createLogger({
      level: level,
      format: winston.format.combine(
        winston.format.timestamp({
          format: timeFmt,
        }),
        winston.format.errors({stack: true}),
        winston.format.splat(),
        winston.format.json()
      ),
      defaultMeta: {service: 'Bali REST Endpoint'},
      transports: [
        new winston.transports.File({
          filename: 'bali-std-err.log',
          level: 'error',
        }),
        new winston.transports.File({filename: 'bali-std-out.log'}),
      ],
    });

    /* Add realtime log format if not production mode */
    if (env !== 'production') {
      if (process.env.NODE_ENV !== 'production') {
        this.write.add(
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.printf(
                info => `${info.timestamp} [${info.level}]: ${info.message}`
              )
            ),
          })
        );
      }
    }
  }

  stream(): any {
    return {
      write: (msg: string, encoding: string) => {
        this.write.info(msg);
      },
    } as any;
  }
}