# Logger library and middleware for Node.JS

[![Build status](https://badge.buildkite.com/02f1fda155a3e5c31b999aaa982370523f9ed53737de174453.svg)](https://buildkite.com/involves/importer-engine-file-uploader)


```
npm install @involvestecnologia/logger-nodejs
```

## Usage - Logger

Basic example how to log with the library:

``` js
const { logger } = require('@involves/logger-nodejs');

(() => {
  logger.info('Logger example')
})()
```

Outputs:
```
{"message":"Logger example","level":"info","timestamp":"2021-03-22T18:10:22.362Z"}
```

You can configure your logger to add more details:

``` js
const packageJson = require('./package.json')
const { LoggerConfigure, logger } = require('@involves/logger-nodejs');

(() => {
  LoggerConfigure({ name: packageJson.name, version: packageJson.version }, process.env.LOG_LEVEL)
  logger.info('Logger example')
})()
```

Outputs:
```
{"message":"Logger example","level":"info","program":{"name":"importer-engine-file-uploader","version":"1.0.0"},"hostname":"inv001029","timestamp":"2021-03-22T18:13:53.470Z"}
```

## Usage - Middleware

Just add the middleware into express:

``` js
const app = require('express')()
const { LoggerMiddleware } = require('@involves/logger-nodejs')

app.use(LoggerMiddleware.logRequest)
```

Example of request log (formatted):
``` json
{
    "message": "Request log",
    "org": {},
    "req": {
        "method": "GET",
        "host": "127.0.0.1",
        "url": "/v1/healthz",
        "headers": {
            "host": "127.0.0.1:37081",
            "accept-encoding": "gzip, deflate",
            "user-agent": "node-superagent/3.8.3",
            "connection": "close"
        }
    },
    "res": {
        "status": 200,
        "headers": {},
        "elapsedTime": 55
    },
    "level": "info",
    "program": {
        "name": "importer-engine-file-uploader",
        "version": "1.0.0"
    },
    "hostname": "64ea6afaa0ff",
    "timestamp": "2021-03-22T18:16:20.231Z"
}
```