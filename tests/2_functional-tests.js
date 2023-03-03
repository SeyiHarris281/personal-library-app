/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  
  test('#example Test GET /api/books', function(done){
    let requester = chai.request(server).keepOpen();
     requester
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {
    let insertedID;


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        const newBook = { 'title': 'Silence of the Lambs' };
        
        chai.request(server)
          .post('/api/books')
          .type('form')
          .send({ ...newBook })
          .end((err, res) => {
            insertedID = res.body._id;
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.isObject(res.body);
            assert.isOk(res.body._id);
            assert.equal(res.body.title, 'Silence of the Lambs');
            done();
          });
        
      });
      
      test('Test POST /api/books with no title given', function(done) {
        const newBook = {};
        
        chai.request(server)
          .post('/api/books')
          .type('form')
          .send({})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'text/html');
            assert.equal(res.text, 'missing required field title');
            done();
          });
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai.request(server)
          .get('/api/books')
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.isArray(res.body, 'response should be an array');
            assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
            assert.property(res.body[0], 'title', 'Books in array should contain title');
            assert.property(res.body[0], '_id', 'Books in array should contain _id');
            done();
          });
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
          .get('/api/books/63f82fd76eb211013cbdd1f6')
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.type, 'text/html');
            assert.equal(res.text, 'no book exists');
            done();
          });
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai.request(server)
          .get(`/api/books/${insertedID}`)
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.isObject(res.body);
            assert.property(res.body, 'commentcount');
            assert.property(res.body, 'title');
            assert.property(res.body, '_id');
            assert.isArray(res.body.comments);
            done();
          });
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        
        chai.request(server)
          .post(`/api/books/${insertedID}`)
          .type('form')
          .send({ comment: 'New interesting comment'})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.isObject(res.body);
            assert.property(res.body, '_id');
            assert.property(res.body, 'title');
            assert.property(res.body, 'comments');
            assert.property(res.body, 'commentcount');
            assert.isArray(res.body.comments);
            assert.equal(res.body.comments[res.body.comments.length - 1], 'New interesting comment');
            done();
          });
        
      });

      test('Test POST /api/books/[id] without comment field', function(done){
        chai.request(server)
          .post(`/api/books/${insertedID}`)
          .type('form')
          .send({})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'text/html');
            assert.equal(res.text, 'missing required field comment')
            done();
          });
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done){
        chai.request(server)
          .post(`/api/books/63f82fd76eb211013cbdd1f6`)
          .type('form')
          .send({ comment: 'New interesting comment'})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'text/html');
            assert.equal(res.text, 'no book exists')
            done();
          });
      });
      
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {

      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        chai.request(server)
          .delete(`/api/books/${insertedID}`)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'text/html');
            assert.equal(res.text, 'delete successful');
            done();
          });
      });

      test('Test DELETE /api/books/[id] with  id not in db', function(done){

        chai.request(server).keepOpen()
          .delete(`/api/books/invalidID`)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'text/html');
            assert.equal(res.text, 'no book exists');
            done();
          });
  
      });

    });

  });

});
