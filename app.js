const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const fs = require('fs');
var cors = require('cors');
const router = express.Router();
const request = require('request');

const http = require('http');
//const https = require('https');
// const options = {
// key: fs.readFileSync('./key.pem'),
// cert: fs.readFileSync('./cert.pem')
// };
const app = express();
const port = process.env.PORT || 8000;
app.set('port', port);
//const server = https.createServer(options, app);
const server = http.createServer(app);

app.use(cors());

///
global.zaloAppId = '1998844287528533439';
global.zaloAppToken = 'nrBD9cEw8WZAMCqbOheY2inPmIDefsTVnJ7K73JCSZBsMjGQBk4oKCjSi7Ck-oX4Yr6P4K7jDasg2ueVM9ytSOC3aXzjdtP3Wmph8rUDTqoI0iqLDuPkGFqXppSCc4ztuJ3z6JAKRbNSQOqQCUyIRFzRe3GFmnru_qEh3L7O37IMIhyaFU0YIlf8mYOer2H_ntAc43Bd9atZSBHaFTKABTCqw7meXNS9xppNPGFRCHteIDvzHijMKBaimpiGfcH-ua27BYlbAcxmNimR1TThSZYTqDSQQQmh1G';
global.oaId = '';
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
   res.status(200).send('hello world');
});

///
///
///

app.get('/api/zalo/request-token', function (req, res) {
   //res.header("Access-Control-Allow-Origin", "*");
   var url = 'https://oauth.zaloapp.com/v3/oa/permission?app_id=' + zaloAppId + '&redirect_uri=' + 'http://' + req.headers['host'] + '/api/zalo/token';
   request(url, function (err, response, body) {
      if (err)
         console.log(err);

   });
   res.status(200).end();
});

// - /api/zalo/getuserinfo - Params: userid - Get user info from id
app.get('/api/zalo/request-user-info', function (req,res, next) {

   var userid = req.query.userid;
   var form = {
      "recipient": {
         "user_id": userid
      },
      "message": {
         "attachment": {
            "payload": {
               "elements": [{
                     "image_url": "https://developers.zalo.me/web/static/zalo.png",
                     "subtitle": "Đang yêu cầu thông tin từ bạn",
                     "title": "Bestaff test OA"
                  }
               ],
               "template_type": "request_user_info"
            },
            "type": "template"
         },
         "text": "hello, world!"
      }
   };
   var url = 'https://openapi.zalo.me/v2.0/oa/message?access_token=' + zaloAppToken;
   request({
      method: 'POST',
      url: url,
      headers: {
         'Content-Type': 'application/json'
      },
      body: JSON.stringify(form)
   }, function (err, response, body) {
      if (err) {
         console.log(err);
         return;
      }
      //console.log(body);
   });

});

// - /api/zalo/messagetouser - Params: userid, message
app.post('/api/zalo/message-to-user', function (req, res, next) {
   var body = {
      "recipient": {
         "user_id": req.body.userid
      },
      "message": req.body.message
   };
   res.status(200).end();
   //request.post({url:'http://service.com/upload', form: {key:'value'}}, function(err,httpResponse,body){ /* ... */ });
});

// - /api/zalo/broadcasttouser - Params: target, message
app.post('/api/zalo/broadcast-to-user', function (req, res, next) {
   var body = {
      "recipient": {
         "target": req.body.target
      },
      "message": req.body.message
   };
   //request.post({url:'http://service.com/upload', form: {key:'value'}}, function(err,httpResponse,body){ /* ... */ });
   res.status(200).end();
});

///
/// Zalo callback
///
app.get('/api/zalo/token', function (req, res) {
   //res.header("Access-Control-Allow-Origin", "*");
   if (req.query.access_token && req.quey.oaId) {
      zaloAppToken = req.query.access_token;
      oaId = req.quey.oaId;
   }
   res.status(200).end();
});

// Zalo events listener, always return status 200
app.post('/api/zalo/events', function (req, res, next) {
   res.status(200).end();
   //console.log('body');
   //console.log(req.body);
   if (!req.body.event_name)
      return;
   switch (req.body.event_name) {
   case 'user_send_text': {
         //console.log(req.body.sender.id);
         var userid = req.body.sender.id;
         if (req.body.message.text.startsWith('hello')) {
            //console.log('startsWith hello');
            // get user data
            var url = 'https://openapi.zalo.me/v2.0/oa/getprofile?access_token=' + zaloAppToken + '&data={"user_id":"' + userid + '"}';
            request(url, function (err, response, body) {
               if (err) {
                  console.log(err);
                  return;
               }
               body = JSON.parse(body);
               var username = body.data.display_name;
               var textBack = "Hello " + username + "!";
               // message back to user
               var message = {
                  "text": textBack
               };
               sendMessageToUser(userid, message);
            });
         } else if (req.body.message.text.startsWith('checkin')) {
            var dts = req.body.message.text.split(' ');
            if (dts.length == 1){
               var message = {
                  "attachment": {
                     "type": "template",
                     "payload": {
                        "template_type": "list",
                        "elements": [{
                              "title": "Phone Number Checkin",
                              "subtitle": "Checkin",
                              "image_url": "https://developers.zalo.me/web/static/zalo.png",
                              "default_action": {
                                 "title": "QUERY HIDE",
                                 "type": "oa.query.hide",
                                 "payload": "#phonecheckin"
                              }
                           }, {
                              "title": "UID Checkin",
                              "subtitle": "Checkin",
                              "image_url": "https://developers.zalo.me/web/static/zalo.png",
                              "default_action": {
                                 "title": "QUERY HIDE",
                                 "type": "oa.query.hide",
                                 "payload": "#uidcheckin"
                              }
                           }
                        ]
                     }
                  }
               };
               sendMessageToUser(userid, message);
            } else if (dts.length == 2 && dts[1].length == 6){
               var uid = 0;
               try{
                  uid = parseInt(dts[1]);
               }catch(err){
                  uid = 0;
               }
               if (uid > 0){
                  var message = { "text": "Check in thanh cong!"};
                  sendMessageToUser(userid, message);
               }
            }else{
               var message = { "text": "Sai cu phap"};
               sendMessageToUser(userid, message);
            }
         }else if (req.body.message.text == "#uidcheckin"){
            var message = { "text": "Moi nhap theo cu phap: checkin [uid]"};
            sendMessageToUser(userid, message);
         }
         break;
      }
   case 'user_received_message': {

         break;
      }
   case 'user_seen_message': {

         break;
      }
   case 'follow': {

         break;
      }
   case 'oa_send_text': {

         break;
      }
   case 'oa_send_image': {

         break;
      }
   case 'oa_send_list': {

         break;
      }
   case 'user_submit_info': {
         var userid = req.body.sender.id;
         var userinfo = req.body.info;
         var userphone = req.body.info.phone; // 84901234567
         break;
      }
   default:
      break;
   }

});

///
///
///
function sendMessageToUser(userid, message) {
   var url = 'https://openapi.zalo.me/v2.0/oa/message?access_token=' + zaloAppToken;
   var form = {
      "recipient": {
         "user_id": userid
      },
      "message": message
   };
   //console.log(JSON.stringify(form));
   request({
      method: 'POST',
      url: url,
      headers: {
         'Content-Type': 'application/json'
      },
      body: JSON.stringify(form)
   }, function (err, response, body) {
      if (err) {
         console.log(err);
         return;
      }
      //console.log(body);
   });
}

///
///
///

// don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
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
