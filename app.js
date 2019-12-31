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

///
///
///
app.get('/api/zalo/token', function (req, res) {
   //res.header("Access-Control-Allow-Origin", "*");
   if (req.query.access_token && req.quey.oaId){
      zaloAppToken = req.query.access_token;
      oaId = req.quey.oaId;
   }
   res.status(200).end();
});

app.get('/api/zalo/gettoken', function (req, res) {
   //res.header("Access-Control-Allow-Origin", "*");
   var url = 'https://oauth.zaloapp.com/v3/oa/permission?app_id='+zaloAppId+'&redirect_uri='+'http://' + req.headers['host'] + '/api/zalo/token';
   request(url,function(err, response, body){
      if (err)
         console.log(err);
      
   });
   res.status(200).end();
});

router.post('/api/zalo/events', function (req, res, next) {
   var body = JSON.parse(req.body);
   switch (body.event_name) {
   case user_send_text: {
         if (body.message.text.startWiths('hello')){
            // say hi
            res.status(200).end();
            // get user data
            var userid = body.sender.id;
            var url = 'https://openapi.zalo.me/v2.0/oa/getprofile?access_token='+zaloAppToken+'&data={"user_id":"'+userid+'"}';
            request(url, function(err,response,body){
               if (err)
                  break;
               var username = body.data.display_name;
               // message back to user
               var url = 'https://openapi.zalo.me/v2.0/oa/message?access_token='+zaloAppToken;
               var form = {
                  "recipient": {
                     "user_id": userid
                  },
                  "message": ("Hello "+ username+"!")
               };
               request.post(url, form: form, function(err,response,body){
                  if (err){
                     console.log(err);
                     break;
                  }
                  
               });
            });
         }
         else if (body.message.text.startWiths('checkin')){
            res.status(200).end();
         }
         return;
      }
   case user_received_message: {

         break;
      }
   case user_seen_message: {

         break;
      }
   case follow: {

         break;
      }
   case oa_send_text: {

         break;
      }
   case oa_send_image: {

         break;
      }
   case oa_send_list: {

         break;
      }
   default:
      break;
   }
   return res.status(200).end();
});

// - /api/zalo/messagetouser - Params: userid, message
router.post('/api/zalo/messagetouser', function (req, res, next) {
   var body = {
      "recipient": {
         "user_id": req.body.userid
      },
      "message": req.body.message
   };
   //request.post({url:'http://service.com/upload', form: {key:'value'}}, function(err,httpResponse,body){ /* ... */ });
});

// - /api/zalo/broadcasttouser - Params: target, message
router.post('/api/zalo/broadcasttouser', function (req, res, next) {
   var body = {
      "recipient": {
         "target": req.body.target
      },
      "message": req.body.message
   };
   //request.post({url:'http://service.com/upload', form: {key:'value'}}, function(err,httpResponse,body){ /* ... */ });
   
});

///
///
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
