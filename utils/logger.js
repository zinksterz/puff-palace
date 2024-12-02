const { createLogger, format, transports } = require("winston");

//Logger config
const logger = createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
    new transports.Console({
      //This is optional for real time debugging
      format: format.combine(format.colorize(), format.simple()),
    }),
  ],
});

module.exports = logger;