const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const fs = require('fs');
var cors = require('cors');

const http = require('http');
//const https = require('https');
const options = {
   key: fs.readFileSync('./zalo-webhook.key'),
   cert: fs.readFileSync('./zalo-webhook.csr')
};
const app = express();
//const server = https.createServer(options, app);
const server = http.createServer(app);
var port = 3000;
app.set('port', port);
app.use(cors());

///
const zaloAppId = '1998844287528533439';
const zaloAppToken = '';
const oaId = '';
///
app.use(function (req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   next();
});

//app.use(favicon(path.join(__dirname, 'public', 'logo.png')));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
      extended: true
   }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
   //res.header("Access-Control-Allow-Origin", "*");
   res.send('hello world');
});

app.get('/zalotoken', function (req, res) {
   //res.header("Access-Control-Allow-Origin", "*");
   if (req.query.access_token && req.quey.oaId){
      zaloAppToken = req.query.access_token;
      oaId = req.quey.oaId;
   }
   res.status(200).end();
});

app.get('/get-zalotoken', function (req, res) {
   //res.header("Access-Control-Allow-Origin", "*");
   var url = 'https://oauth.zaloapp.com/v3/oa/permission?app_id='+zaloAppId+'&redirect_uri='+'http://' + req.headers['host'] + '/zalotoken';
   request(url,function(err, response, body){
      if (err)
         console.log(err);
      
   });
   res.status(200).end();
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   var err = new Error('Not Found');
   err.status = 404;
   next(err);
});

// development error handler - will print stacktrace
if (app.get('env') === 'development') {
   app.use(function (err, req, res, next) {
      res.status(err.status || 500);
      res.send(err.message);
   });
}

// production error handler - no stacktraces leaked to user
app.use(function (err, req, res, next) {
   res.status(err.status || 500);
   res.send(err.message);
});

// don't show the log when it is test
if(process.env.NODE_ENV !== 'test') {
    //use morgan to log at command line
    app.use(logger('combined')); //'combined' outputs the Apache style LOGs
}

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
   if (error.syscall !== 'listen') {
      throw error;
   }

   var bind = typeof port === 'string'
       ? 'Pipe ' + port
       : 'Port ' + port;

   // handle specific listen errors with friendly messages
   switch (error.code) {
   case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
   case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
   default:
      throw error;
   }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
   var addr = server.address();
   var bind = typeof addr === 'string'
       ? 'pipe ' + addr
       : 'port ' + addr.port;
   console.log('Listening on ' + bind);
}

module.exports = {
   app: app,
   server: server
};
