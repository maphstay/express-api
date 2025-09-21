import winston from 'winston';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const consoleFormat = combine(
  colorize(),
  timestamp(),
  errors({ stack: true }),
  printf(({ timestamp, level, message, stack, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${stack || ''} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
  }),
);

export const winstonLogger = winston.createLogger({
  level: 'debug',
  format: combine(timestamp(), errors({ stack: true }), json()),
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
});
