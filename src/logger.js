const hostname = require('os').hostname()
const winston = require('winston')

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()),
  transports: [
    new winston.transports.Console()
  ]
})

function LoggerConfigure (service, level = 'debug') {
  logger.defaultMeta = {
    program: { name: service.name, version: service.version },
    hostname: hostname
  }
  logger.level = level
}

module.exports = {
  logger,
  LoggerConfigure
}
