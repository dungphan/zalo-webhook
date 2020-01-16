//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

//Require the dev-dependencies
if (!global.Promise) {
   global.Promise = require('bluebird');
}
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app').server;
let should = chai.should();

chai.use(chaiHttp);
// Our parent block
describe('APIs', () => {
   beforeEach((done) => {
      // Before each test we empty the database in your case
      done();
   });
   /*
    * Test the /GET route
    */
   describe('/GET /api/zalo/token', () => {
      it('it should GET 403', (done) => {
         chai.request(server)
         .get('/api/zalo/token')
         .end((err, res) => {
            res.should.have.status(200);
            done();
         });
      });
   });

   /*
    * Test the /POST login route
    */
   describe('/POST /api/zalo/events', () => {
      it('it should Logged in', async function () {
         chai.request(server)
         .post('/api/zalo/events')
         .send({
           "app_id": "1998844287528533439",
           "user_id_by_app": "5062126491192652805",
           "event_name": "user_send_text",
           "timestamp": "1577762112225",
           "sender": {
             "id": "6071575625644762682"
           },
           "recipient": {
             "id": "3487428636512146270"
           },
           "message": {
             "msg_id": "This is message id",
             "text": "testwelcome"
           }
         })
         .then(function (res) {
            expect(res).to.have.status(200);
         })
         .catch(function (err) {
            throw err;
         });
      });
   });
});
