const constants = require('./src/logger-constants')
const { logger, configureLogger } = require('./src/logger')
const LoggerMiddleware = require('./src/logger-middleware')

module.exports = {
  constants,
  logger,
  configureLogger,
  LoggerMiddleware
}
