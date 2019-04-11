dojot-module-logger
===================

This component is a simple logger, based on [winston](https://github.com/winstonjs/winston), that
offers an endpoint to be added to an Express application.

# How to use

It's simple. Just import it and use it: 

```javascript
   const DojotLogger = require("@dojot/dojot-module-logger-nodejs");
   DojotLogger.logger.debug("This is an example", {filename: "my_module"});
```

You can change its current log level by calling:

```javascript
   DojotLogger.logger.setLevel("info");
```

You should definitely check out [winston
documentation](https://github.com/winstonjs/winston) for more information about
how to use it.

You can add an endpoint to your component as well:

```javascript

   var bodyParser = require("body-parser");
   var express = require("express");
   var app = express();

   app.use(bodyParser.json());
   app.use(DojotLogger.getHTTPRouter());
   app.listen(10001, () => {
       DojotLogger.logger.info(`Listening on port 10001.`);
   });

```

Thus you can call:

```bash

   curl -X PUT http://localhost:10001/log -H "Content-Type:application/json" -d '{"level" : "debug"}'

```
to change current log level. Currently supported levels are:

- debug
- info
- warn
- error

In order to get current log level, just send a GET request to the same endpoint:

```bash

   curl -X GET http://localhost:10001/log 

```
