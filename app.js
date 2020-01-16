const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const fs = require('fs');
var cors = require('cors');
const router = express.Router();
const request = require('request');
//const redis = require('redis');
const Promise = require('bluebird');
Promise.promisifyAll(redis);

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
function LoadData(){
   global.zaloAppToken = fs.readFileSync('./zalotoken.txt',"utf8");
   //console.log(global.zaloAppToken);
   global.oaId = fs.readFileSync('./oaid.txt',"utf8");
   //console.log(global.oaId);
}
LoadData();

/* const client = redis.createClient(6379);
client.on('error', (err) => {
   console.log("Redis Error ");
   console.log(err);
}); */


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
// - /api/zalo/request-token - Request token from zalo
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

// - /api/zalo/message-to-user - Params: userid, message
app.post('/api/zalo/message-to-user', function (req, res, next) {
   res.status(200).end();
   sendMessageToUser(req.body.userid, req.body.message);
});

// - /api/zalo/broadcast-to-user - Params: target, message
app.post('/api/zalo/broadcast-to-user', function (req, res, next) {
   var form = {
      "recipient": {
         "target": req.body.target
      },
      "message": req.body.message
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
   res.status(200).end();
});

///
/// Zalo callback
///
app.get('/api/zalo/token', function (req, res) {
   //res.header("Access-Control-Allow-Origin", "*");
   if (req.query.access_token && req.query.oaId) {
      global.zaloAppToken = req.query.access_token;
      global.oaId = req.query.oaId;
      fs.writeFileSync('./token.txt',global.zaloAppToken,function(err){
         if (err)
            console.log(err);
      });
      fs.writeFileSync('./oaid.txt',global.oaId,function(err){
         if (err)
            console.log(err);
      });
      return res.status(200).send(global.zaloAppToken);
   }
   res.status(200).end();
});

// Zalo events listener, always return status 200
app.post('/api/zalo/events', async function (req, res, next) {
   res.status(200).end();
   //console.log('body');
   //console.log(req.body);
   if (!req.body.event_name)
      return;
   switch (req.body.event_name) {
   case 'user_send_text': {
         userSendText(req.body);
         break;
      }
   case 'user_received_message': {

         break;
      }
   case 'user_seen_message': {

         break;
      }
   case 'follow': {
         userFollow(req.body);
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
         userSubmitInfo(req.body);
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

async function userSendText(body){
   //console.log(body.sender.id);
   var userid = body.sender.id;
   var userString = null;
   try{         
      userString = "";//await client.getAsync(userid);
   }catch(err){
      console.log(err);
   }
   var userData = null;
   if (userString && userString.length > 0)
      userData = JSON.parse(userString);
   if (userData && userData.isWaitInfo){
      userData.isWaitInfo = false;
      //client.setAsync(userid, JSON.stringify(userData));
   }
   if (body.message.text.startsWith('hello')) {
      //console.log('startsWith hello');
      if (userData) {
         var username = userData.name;
         var textBack = "Hello " + username + "!";
         // message back to user
         var message = {
            "text": textBack
         };
         sendMessageToUser(userid, message);
      }else{
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
            //var response = {name:username};
            //client.setAsync(userid, JSON.stringify(response));
         });
      }
   }
   else if (body.message.text.startsWith('checkin')) {
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
   }
   else if (body.message.text == "#uidcheckin"){
      var message = { "text": "Moi nhap theo cu phap: #checkin [uid]"};
      sendMessageToUser(userid, message);
   }
   else if (body.message.text == "#phonecheckin"){
      if (userData && userData.phone) {
         var phone = userData.phone;
         // checkin by phone
         userCheckinPhone(userid,phone);
      }else{
         // ask for info
         requestUserInfo(userid, userData);
      }
   }
   else if (body.message.text.startsWith("#checkin")){
      var dts = body.message.text.split(' ');
      if (dts.length == 2){
         if (dts[1].length == 6){
            // uid
            var uid = 0;
            try{
               uid = parseInt(dts[1]);
            }catch(err){
               uid = 0;
            }
            if (uid > 0){
               userCheckinUid(userid,uid);
            }else{
               var message = { "text": "Uid khong dung"};
               sendMessageToUser(userid, message);
            }
         }else if (dts[1].length == 10){
            var phone = "84" + dts[1].substr(1); // 84905112233
            userCheckinPhone(userid,phone);
         }else{
            var message = { "text": "Sai cu phap"};
            sendMessageToUser(userid, message);
         }
      }else{
         var message = { "text": "Sai cu phap"};
         sendMessageToUser(userid, message);
      }
   }
   else if (body.message.text == "#news"){
      // fetch news
      userFetchNews(userid);
   }
   else if (body.message.text == "#timesheet"){
      // fetch timesheet
      userFetchTimesheet(userid);
   }
   else if (body.message.text == "testwelcome"){
      // fetch timesheet
      var res = {
         follower: {
            id : body.sender.id
         }
      };
      userFollow(res);
   }
}

function userFollow(body){
   var userid = body.follower.id;
   var message = {
      "attachment": {
         "type": "template",
         "payload": {
            "template_type": "list",
            "elements": [{
                "title": "Chao mung den voi bestaff",
                "subtitle": "Bestaff la ung dung cham cong va quan ly nhan su",
                "image_url": "https://developers.zalo.me/web/static/zalo.png",
                "default_action": {
                    "type": "oa.open.url",
                    "url": "https://developers.zalo.me/"
                    }
            },
            {
                "title": "Cach dang ki thanh vien quan",
                "subtitle": "Cach dang ki thanh vien quan",
                "image_url": "https://developers.zalo.me/web/static/zalo.png",
                "default_action": {
                    "type": "oa.open.url",
                    "url": "https://developers.zalo.me/"
                    }
            },
            {
                "title": "Huong dan su dung bot",
                "subtitle": "Huong dan su dung bot",
                "image_url": "https://developers.zalo.me/web/static/zalo.png",
                "default_action": {
                    "type": "oa.open.url",
                    "url": "https://developers.zalo.me/"
                    }
            },
            {
                "title": "Ve bestaff",
                "subtitle": "Ve bestaff",
                "image_url": "https://developers.zalo.me/web/static/zalo.png",
                "default_action": {
                    "type": "oa.open.url",
                    "url": "https://developers.zalo.me/"
                    }
            }]
         }
      }
   };
   sendMessageToUser(userid, message);
}

async function userSubmitInfo(body){
   var userid = body.sender.id;
   var userinfo = body.info;
   var userphone = body.info.phone; // 84901234567
   var userid = body.sender.id;
   var userString = null;
   try{
      userString = "";//await client.getAsync(userid);
   }catch(err){
      console.log(err);
   }
   var userData = null;
   if (userString && userString.length>0)
      userData = JSON.parse(userString);
   if (userData){
      if (userData.isWaitInfo)
         userData.isWaitInfo = false;
      userData.name = userinfo.name;
      userData.phone = userinfo.phone;
      userData.address = userinfo.address;
      userData.district = userinfo.district;
      userData.city = userinfo.city;
      //client.setAsync(userid, JSON.stringify(userData));
   }else{
      //client.setAsync(userid, JSON.stringify(userinfo));
   }
}

function userCheckinUid(userid,uid){
   var message = { "text": "Check in thanh cong!"};
   sendMessageToUser(userid, message);
}

function userCheckinPhone(userid,phone){
   var message = { "text": "Check in thanh cong!"};
   sendMessageToUser(userid, message);
}

function userFetchNews(userid, userData){
   if (userData && userData.phone){
      var elements = [];
      for (var q = 0; q < 5; q++){
         elements[q] = {
                   "title": "Thong bao "+(q+1),
                   "subtitle": "Zalo API cung cấp các công cụ để bạn có thể kết nối thanh chóng và hiệu quả",
                   "image_url": "https://developers.zalo.me/web/static/zalo.png",
                   "default_action": {
                       "type": "oa.open.url",
                       "url": "https://developers.zalo.me/"
                       }
               };
      }
      var message = { 
         "attachment": {
           "type": "template",
           "payload": {
               "template_type": "list",
               "elements": elements
            }
         }
       };
      sendMessageToUser(userid, message);
   }else{
      requestUserInfo(userid, userData);
   }
}

function userFetchTimesheet(userid, userData){
   if (userData && userData.phone){
      var elements = [];
      for (var q = 0; q < 5; q++){
         elements[q] = {
                   "title": "Lich su "+(q+1),
                   "subtitle": "Zalo API cung cấp các công cụ để bạn có thể kết nối thanh chóng và hiệu quả",
                   "image_url": "https://developers.zalo.me/web/static/zalo.png",
                   "default_action": {
                       "type": "oa.open.url",
                       "url": "https://developers.zalo.me/"
                       }
               };
      }
      var message = { 
         "attachment": {
           "type": "template",
           "payload": {
               "template_type": "list",
               "elements": elements
            }
         }
       };
      sendMessageToUser(userid, message);
   }else{
      requestUserInfo(userid, userData);
   }
}

function requestUserInfo(userid, userData){
   var message = { 
      "text": "hello, world!",
      "attachment": {
         "type": "template",
         "payload": {
            "template_type": "request_user_info",
            "elements": [{
               "title": "Bestaff Test OA",
               "subtitle": "Chia sẻ số điện thoại để checkin hoặc nhắn theo cú pháp #checkin [phone].",
               "image_url": "https://developers.zalo.me/web/static/zalo.png"
            }]
         }
      }
   };
   sendMessageToUser(userid, message);
   if (userData){
      userData.isWaitInfo = true;
      //client.setAsync(userid, JSON.stringify(userData));
   }
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
