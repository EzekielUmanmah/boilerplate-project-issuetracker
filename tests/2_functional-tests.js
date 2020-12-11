const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  let id;
  let id2;
  
  suite('POST requests', function(){
    
    test('Create an issue with every field', function(done){

      chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'test title',
        issue_text: 'test text',
        created_by: 'Bobby',
        assigned_to: 'Larry',
        status_text: 'Need to test all fields posted'
      })
      .end(function(err, res){
        id = res.body._id;
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.body.issue_title, 'test title');
        assert.equal(res.body.issue_text, 'test text');
        assert.equal(res.body.created_by, 'Bobby');
        assert.equal(res.body.assigned_to, 'Larry');
        assert.equal(res.body.status_text, 'Need to test all fields posted');
        done();
      });
    });

    test('Create an issue with only required fields', function(done){
      chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'test title',
        issue_text: 'test text',
        created_by: 'Bobby'
      })
      .end(function(err, res){
        id2 = res.body._id;
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.body.issue_title, 'test title');
        assert.equal(res.body.issue_text, 'test text');
        assert.equal(res.body.created_by, 'Bobby');
        done();
      });
    });

    test('Create an issue with missing required fields', function(done){
      chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Only one required field is sent'
      })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        //assert.equal(res.body.error, 'required field(s) missing');
        assert.deepEqual(res.body, { error: 'required field(s) missing' });
        done();
      });
    });

  });

  suite('GET requests', function(){

    test('View issues on a project', function(done){
      chai.request(server)
      .get('/api/issues/test')
      .end(function(err, res){ 
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isObject(res.body[0]);
        assert.property(res.body[0], 'issue_title');
        assert.property(res.body[0], 'issue_text');
        assert.property(res.body[0], 'created_by');
        assert.property(res.body[0], 'assigned_to');
        assert.property(res.body[0], 'status_text');
        done();
      });
    });

    test('View issues on a project with one filter', function(done){
      chai.request(server)
      .get('/api/issues/test')
      .query({ issue_title: 'test title' })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isObject(res.body[0]);
        assert.equal(res.body[0].issue_title, 'test title');
        assert.equal(res.body[0].issue_text, 'test text');
        assert.equal(res.body[0].created_by, 'Bobby');
        assert.equal(res.body[0].assigned_to, 'Larry');
        assert.equal(res.body[0].status_text, 'Need to test all fields posted');
        done();
      });
    });

    test('View issues on a project with multiple filters', function(done){
      chai.request(server)
      .get('/api/issues/test')
      .query({ 
        issue_title:'test title',
        issue_text:'test text' 
      })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isObject(res.body[0]);
        assert.equal(res.body[0].issue_title, 'test title');
        assert.equal(res.body[0].issue_text, 'test text');
        assert.equal(res.body[0].created_by, 'Bobby');
        assert.equal(res.body[0].assigned_to, 'Larry');
        assert.equal(res.body[0].status_text, 'Need to test all fields posted');
        done();
      });
    });

  });

  suite('PUT requests', function(){

    test('Update one field on an issue', function(done){
      chai.request(server)
      .put('/api/issues/test')
      .send({
        _id: id,
        issue_title: 'New issue title'
      })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { result: 'successfully updated', _id: id });
        done();
      });
    });

    test('Update multiple fields on an issue', function(done){
      chai.request(server)
      .put('/api/issues/test')
      .send({
        _id: id2,
        issue_title: 'Update multiple fields',
        issue_text: 'The response is not the issue object'
      })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { result: 'successfully updated', _id: id2 });
        done();
      });
    });

    test('Update an issue with missing _id', function(done){
      chai.request(server)
      .put('/api/issues/test')
      .send({
        issue_title: 'asdf'
      })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'missing _id' });
        done();
      });
    });

    test('Update an issue with no fields to update', function(done){
      chai.request(server)
      .put('/api/issues/test')
      .send({
        _id: id
      })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'no update field(s) sent', '_id': id });
        done();
      });
    });

    test('Update an issue with an invalid _id', function(done){
      let badId = '5fd2e6ab7f2f31107d29asdf';
      chai.request(server)
      .put('/api/issues/test')
      .send({
        _id: badId,
        issue_title: 'badId'
      })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { 
            error: 'could not update', 
            '_id': badId
          });
        done();
      });
    });

  });

  suite('DELETE requests', function(){

    test('Delete an issue', function(done){
      chai.request(server)
      .delete('/api/issues/test')
      .send({
        _id: id
      })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { result: 'successfully deleted', '_id': id });
        done();
      });
    });

    test('Delete an issue with an invalid _id', function(done){
      let badId = '5fd2e6ab7f2f31107d29asdf';
      chai.request(server)
      .delete('/api/issues/test')
      .send({
        _id: badId
      })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'could not delete', '_id': badId });
        done();
      });
    });

    test('Delete an issue with missing _id', function(done){
      chai.request(server)
      .delete('/api/issues/test')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'missing _id' });
        done();
      });
    });

  });

});
