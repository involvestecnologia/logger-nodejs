const { logger, LoggerConfigure } = require('./src/logger')
const LoggerConstants = require('./src/logger-constants')
const LoggerMiddleware = require('./src/logger-middleware')

module.exports = {
  logger,
  LoggerConfigure,
  LoggerConstants,
  LoggerMiddleware
}
