const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { suite, test } = require('mocha');

chai.use(chaiHttp);

// Creating a new thread: POST request to /api/threads/{board}
// Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}
// Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password
// Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password
// Reporting a thread: PUT request to /api/threads/{board}
// Creating a new reply: POST request to /api/replies/{board}
// Viewing a single thread with all replies: GET request to /api/replies/{board}
// Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password
// Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password
// Reporting a reply: PUT request to /api/replies/{board}

let thread_id_for_test;
let reply_id_for_test;
let thread_pass = 'ft_threadPass_1';
let reply_pass = 'ft_replyPass_1';
let thread_text = 'ft_thread_1';
let reply_text = 'ft_reply_1';

suite('Functional Tests', function () {
  this.timeout(20000);
  test('1. Creating a new thread: POST request to /api/threads/{board}', done => {
    chai
      .request(server)
      .post('/api/threads/ft_board_1')
      .set('content-type', 'application/json')
      .send({ text: thread_text, delete_password: thread_pass })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.typeOf(res.body, 'Array', 'Response body is array');
        assert.property(res.body[0], '_id');
        thread_id_for_test = res.body[0]._id;
        assert.property(res.body[0], 'text');
        assert.equal(res.body[0].text, thread_text);
        assert.property(res.body[0], 'created_on');
        assert.typeOf(new Date(res.body[0].created_on), 'Date');
        assert.property(res.body[0], 'bumped_on');
        assert.typeOf(new Date(res.body[0].bumped_on), 'Date');
        assert.property(res.body[0], 'reported');
        assert.typeOf(res.body[0].reported, 'Boolean');
        assert.property(res.body[0], 'delete_password');
        assert.equal(res.body[0].delete_password, thread_pass);
        assert.property(res.body[0], 'replies');
        assert.typeOf(res.body[0].replies, 'Array');
        done();
      });
  });
  test('2. Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}', done => {
    chai
      .request(server)
      .get('/api/threads/ft_board_1')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.exists(res.body[0]);
        assert.property(res.body[0], 'text');
        assert.equal(res.body[0].text, thread_text);
        done();
      });
  });

  test('3. Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password', done => {
    chai
      .request(server)
      .delete('/api/threads/ft_board_1')
      .set('content-type', 'application/json')
      .send({ thread_id: thread_id_for_test, delete_password: 'wrong_pass' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'incorrect password');
        done();
      });
  });
  test('5. Reporting a thread: PUT request to /api/threads/{board}', done => {
    chai
      .request(server)
      .put('/api/threads/ft_board_1')
      .set('content-type', 'application/json')
      .send({ thread_id: thread_id_for_test })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'reported');
        done();
      });
  });
  test('6. Creating a new reply: POST request to /api/replies/{board}', done => {
    chai
      .request(server)
      .post('/api/replies/ft_board_1')
      .set('content-type', 'application/json')
      .send({
        text: reply_text,
        delete_password: reply_pass,
        thread_id: thread_id_for_test
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body._id, thread_id_for_test);
        assert.equal(res.body.text, thread_text);
        assert.notDeepEqual(res.body.created_on, res.body.bumped_on);
        assert.property(res.body, 'replies');
        assert.typeOf(res.body.replies, 'Array');
        assert.property(res.body.replies[0], '_id');
        reply_id_for_test = res.body.replies[0]._id;
        assert.equal(res.body.replies[0].text, reply_text);
        done();
      });
  });
  test('7. Viewing a single thread with all replies: GET request to /api/replies/{board}', done => {
    chai
      .request(server)
      .get('/api/replies/ft_board_1')
      .set('content-type', 'application/json')
      .query({ thread_id: thread_id_for_test })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body._id, thread_id_for_test);
        assert.equal(res.body.text, thread_text);
        assert.property(res.body, 'replies');
        assert.typeOf(res.body.replies, 'Array');
        assert.lengthOf(res.body.replies, 1);
        assert.equal(res.body.replies[0]._id, reply_id_for_test);
        assert.equal(res.body.replies[0].text, reply_text);
        done();
      });
  });
  test('8. Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password', done => {
    chai
      .request(server)
      .delete('/api/replies/ft_board_1')
      .set('content-type', 'application/json')
      .send({
        thread_id: thread_id_for_test,
        reply_id: reply_id_for_test,
        delete_password: 'wrong_pass'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'incorrect password');
        done();
      });
  });
  test('10. Reporting a reply: PUT request to /api/replies/{board}', done => {
    chai
      .request(server)
      .put('/api/replies/ft_board_1')
      .set('content-type', 'application/json')
      .send({ thread_id: thread_id_for_test, reply_id: reply_id_for_test })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'reported');
        done();
      });
  });

///// "Delete"s were carried into the end, otherwise the other tasks get failed

  test('9. Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password', done => {
    chai
      .request(server)
      .delete('/api/replies/ft_board_1')
      .set('content-type', 'application/json')
      .send({
        thread_id: thread_id_for_test,
        reply_id: reply_id_for_test,
        delete_password: reply_pass
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'success');
        done();
      });
  });
  test('4. Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password', done => {
    chai
      .request(server)
      .delete('/api/threads/ft_board_1')
      .set('content-type', 'application/json')
      .send({ thread_id: thread_id_for_test, delete_password: thread_pass })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'success');
        done();
      });
  });
});
