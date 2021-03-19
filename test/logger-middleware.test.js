const assert = require('assert').strict
const stdout = require('test-console').stdout

const { constants, configureLogger, LoggerMiddleware } = require('../index')

describe('Middleware request logger tests', function () {
  let config, inspect, req

  before(function () {
    config = { name: 'my-test', version: '1.0.2' }
    configureLogger(config)

    req = {
      headers: {
        'x-real-ip': '192.168.0.1'
      },
      id: 'alkoeiew01!)94fkdsl2',
      method: 'GET',
      hostname: 'host-of-the-user',
      originalUrl: '/v1/get/test'
    }
    req.headers[constants.REQUEST_ID] = 5436772
    req.headers[constants.CLIENT_ID] = 2
    req.headers[constants.USER_ID] = 'abcd'
    req.headers[constants.ENVIRONMENT_ID] = 0
    req.headers[constants.APPLICATION] = 'test-app'
  })

  it('should log successful request when contain all attributes defined', function (done) {
    inspect = stdout.inspect()
    const message = 'Request log'
    const res = {
      end: endRequest,
      on: function (name, fn) {

      },
      removeListener: function (name, fn) {

      },
      getHeaders: function () {
        return {
          'content-length': 10
        }
      }
    }
    LoggerMiddleware.logRequest(req, res, next)
    res.end() // simulating the end of request

    function endRequest () {
      const log = JSON.parse(inspect.output)
      inspect.restore()

      assert.ok(log.req)
      assert.ok(log.res)
      assert.ok(log.req.headers)
      assert.equal(log.level, 'info')
      assert.equal(log.message, message)
      assert.equal(log.program.name, config.name)
      assert.equal(log.program.version, config.version)
      assert.equal(log.traceId, req.headers[constants.REQUEST_ID])
      assert.equal(log.org.clientId, req.headers[constants.CLIENT_ID])
      assert.equal(log.org.userId, req.headers[constants.USER_ID])
      assert.equal(log.org.environmentId, req.headers[constants.ENVIRONMENT_ID])
      assert.equal(log.org.applicationId, req.headers[constants.APPLICATION])
      assert.equal(log.req.id, req.id)
      assert.equal(log.req.method, req.method)
      assert.equal(log.req.host, req.hostname)
      assert.equal(log.req.url, req.originalUrl)
      assert.equal(log.req.ip, req.headers['x-real-ip'])
      assert.deepEqual(log.req.headers, req.headers)
      const date = new Date(log.timestamp)
      assert.ok(!isNaN(date.getTime()))

      done()
    }

    function next () {}
  })

  it('should log aborted request when contain all attributes defined', function (done) {
    inspect = stdout.inspect()
    const message = 'Request was aborted'
    const listeners = {}
    const res = {
      end: endRequest,
      on: function (name, fn) {
        listeners[name] = fn
      },
      removeListener: function (name) {
        delete listeners[name]
      },
      getHeaders: function () {
        return {
          'content-length': 10
        }
      }
    }
    LoggerMiddleware.logRequest(req, res, next)
    listeners.close() // simulating the abort of request

    const log = JSON.parse(inspect.output)
    inspect.restore()

    assert.ok(log.req)
    assert.ok(log.res)
    assert.ok(log.req.headers)
    assert.equal(log.level, 'info')
    assert.equal(log.message, message)
    assert.equal(log.program.name, config.name)
    assert.equal(log.program.version, config.version)
    assert.equal(log.traceId, req.headers[constants.REQUEST_ID])
    assert.equal(log.org.clientId, req.headers[constants.CLIENT_ID])
    assert.equal(log.org.userId, req.headers[constants.USER_ID])
    assert.equal(log.org.environmentId, req.headers[constants.ENVIRONMENT_ID])
    assert.equal(log.org.applicationId, req.headers[constants.APPLICATION])
    assert.equal(log.req.id, req.id)
    assert.equal(log.req.method, req.method)
    assert.equal(log.req.host, req.hostname)
    assert.equal(log.req.url, req.originalUrl)
    assert.equal(log.req.ip, req.headers['x-real-ip'])
    assert.deepEqual(log.req.headers, req.headers)
    const date = new Date(log.timestamp)
    assert.ok(!isNaN(date.getTime()))
    done()

    function endRequest () {}
    function next () {}
  })

  it('should log error request when contain all attributes defined', function (done) {
    inspect = stdout.inspect()
    const message = 'Request with error'
    const listeners = {}
    const res = {
      end: endRequest,
      on: function (name, fn) {
        listeners[name] = fn
      },
      removeListener: function (name) {
        delete listeners[name]
      },
      getHeaders: function () {
        return {
          'content-length': 10
        }
      }
    }
    LoggerMiddleware.logRequest(req, res, next)
    listeners.error(new Error('Pony is gone')) // simulating error of request

    const log = JSON.parse(inspect.output)
    inspect.restore()

    assert.ok(log.req)
    assert.ok(log.res)
    assert.ok(log.req.headers)
    assert.equal(log.level, 'error')
    assert.equal(log.message, message)
    assert.equal(log.program.name, config.name)
    assert.equal(log.program.version, config.version)
    assert.equal(log.traceId, req.headers[constants.REQUEST_ID])
    assert.equal(log.org.clientId, req.headers[constants.CLIENT_ID])
    assert.equal(log.org.userId, req.headers[constants.USER_ID])
    assert.equal(log.org.environmentId, req.headers[constants.ENVIRONMENT_ID])
    assert.equal(log.org.applicationId, req.headers[constants.APPLICATION])
    assert.equal(log.req.id, req.id)
    assert.equal(log.req.method, req.method)
    assert.equal(log.req.host, req.hostname)
    assert.equal(log.req.url, req.originalUrl)
    assert.equal(log.req.ip, req.headers['x-real-ip'])
    assert.equal(log.error.message, 'Pony is gone')
    assert.deepEqual(log.req.headers, req.headers)
    const date = new Date(log.timestamp)
    assert.ok(!isNaN(date.getTime()))
    done()

    function endRequest () {}
    function next () {}
  })
})
