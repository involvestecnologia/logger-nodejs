'use strict'

const constants = require('./logger-constants')
const { logger } = require('./logger')

const CONTENT_LENGTH = 'content-length'

/**
 {
  "timestamp": "timestamp which the log entry was emitted, must be from UTC",
  "hostname": "name of the host which the program",
  "level": "string representation of the log level (trace|debug|info|warn|error|fatal)",
  "message": "descriptive message of the log entry",
  "traceId": "unique identifier to enable traceability",
  "org": {
    "clientId": "client unique identifier",
    "userId": "user unique identifier",
    "environmentId": "environment unique identifier",
    "applicationId": "application unique identifier"
  },
  "program": {
    "name": "name of the program",
    "version": "unique identifier of the program being executed"
  },
  "req": {
    "id": "request unique identifier",
    "method": "http method",
    "scheme": "scheme of the request",
    "host": "host of the request",
    "url": "request url with path, query and fragments",
    "headers": {
      "name of the header in lowercase": "value of the header in lowercase"
    },
    "body": "string representation of the request body",
    "ip": "IP address of the client that initiates the request"
  },
  "res": {
    "status": "http status code",
    "headers": {
      "name of the header in lowercase": "value of the header in lowercase"
    },
    "body": "string representation of the response body",
    "bodyByteLength": "byte length of the response body",
    "elapsedTime": "time duration to process the request"
  },
  "error": {
    "message": "error message",
    "stacktrace": "error stacktrace"
  }
}
 */

class LoggerMiddlware {
  static logRequest (req, res, next) {
    const start = Date.now()

    const resSendFn = res.end
    res.end = function (data) {
      finishRequest(data)
      resSendFn.apply(res, arguments)
    }

    const headers = req.headers || {}
    const log = {
      message: 'Request log',
      traceId: headers[constants.REQUEST_ID],
      org: {
        clientId: headers[constants.CLIENT_ID],
        userId: headers[constants.USER_ID],
        environmentId: headers[constants.ENVIRONMENT_ID],
        applicationId: headers[constants.APPLICATION]
      },
      req: {
        id: req.id,
        method: req.method,
        host: req.hostname,
        url: req.originalUrl,
        headers: headers,
        ip: headers['x-real-ip']
      }
    }

    res.on('error', errorRequest)
    res.on('close', closeRequest)

    function finishRequest (responseBody) {
      removeListener()
      const resHeaders = res.getHeaders()
      const elapsedTime = (Date.now() - start)
      log.res = {
        status: res.statusCode,
        headers: resHeaders,
        bodyByteLength: resHeaders[CONTENT_LENGTH],
        elapsedTime: elapsedTime
      }
      if (res.logBody) {
        if (responseBody && responseBody instanceof Uint8Array) {
          log.res.body = responseBody.toString('utf8')
        }
        log.req.body = JSON.stringify(req.body)
      }
      logger.info(log)
    }

    function errorRequest (err) {
      removeListener()
      const resHeaders = res.getHeaders()
      const elapsedTime = (Date.now() - start)
      log.res = {
        status: (res || {}).statusCode,
        headers: resHeaders,
        bodyByteLength: resHeaders[CONTENT_LENGTH],
        elapsedTime: elapsedTime
      }
      const error = err || {}
      log.error = {
        message: error.message,
        stacktrace: error.stack
      }
      log.message = 'Request with error'
      logger.error(log)
    }

    function closeRequest () {
      removeListener()
      const resHeaders = res.getHeaders()
      const elapsedTime = (Date.now() - start)
      log.res = {
        status: res.statusCode,
        headers: resHeaders,
        body: JSON.stringify(res.body),
        bodyByteLength: resHeaders[CONTENT_LENGTH],
        elapsedTime: elapsedTime
      }
      log.message = 'Request was aborted'
      logger.info(log)
    }

    function removeListener () {
      res.removeListener('error', errorRequest)
      res.removeListener('close', closeRequest)
    }

    return next()
  }
}

module.exports = LoggerMiddlware
