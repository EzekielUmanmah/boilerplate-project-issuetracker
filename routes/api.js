'use strict';
const mongoose = require('mongoose');
const issueSchema = require('../schemas/issueSchema');

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(function (req, res){

      let project = req.params.project;
      
      const { issue_title, issue_text, created_by, assigned_to, status_text, open, created_on, updated_on, _id } = req.query;

      issueSchema.find({project})
      .exec()
      .then(result => { 
        if(issue_title) {
          result = result.filter(x => x.issue_title == issue_title)
        }
        if(issue_text){
          result = result.filter(x => x.issue_text == issue_text)
        }
        if(created_by){
          result = result.filter(x => x.created_by == created_by)
        }
        if(assigned_to){
          result = result.filter(x => x.assigned_to == assigned_to)
        }
        if(status_text){
          result = result.filter(x => x.status_text == status_text)
        }
        if(open){
          result = result.filter(x => x.open == open)
        }
        if(created_on){
          result = result.filter(x => x.created_on == created_on)
        }
        if(updated_on){
          result = result.filter(x => x.updated_on == updated_on)
        }
        if(_id){
          result = result.filter(x => x._id == _id)
        }
        return res.send(result);
      })
      .catch(err => console.log(err));

    })
    
    //the POST request should take user input and save to the db and return the newly created issue object.
    .post(function (req, res){

      let project = req.params.project;

      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      if(!issue_title || !issue_text || !created_by) return res.send({ error: 'required field(s) missing' });

      const newIssue = new issueSchema({
        project,
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to || '',
        status_text: status_text || '',
        open: true,
        created_on: new Date().toISOString(),
        updated_on: new Date().toISOString()
      });

      newIssue.save( (err, result) => {
        if(err) console.log(err); 
        if(result) return res.json(result)
      });
      
    })
    
    .put(function (req, res){
      let project = req.params.project;

      const { _id, issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      //if no id, send error
      if(!_id) return res.json({ error: 'missing _id' });
      //if an update field is filled, add to updateObj
      let updateObj = {};
      Object.keys(req.body).forEach(x => {
        if(req.body[x] != ''){
          updateObj[x] = req.body[x]
        }
      });
      //if no update field besides id, send error
      if(Object.keys(updateObj).length < 2) return res.json({ error: 'no update field(s) sent', '_id': _id });
      //valid updateObj so update updated_on field
      Object.assign(updateObj, {updated_on: new Date().toISOString()});

      issueSchema.findByIdAndUpdate(_id, updateObj, (err, result) => {
        if(err) console.log(err);
        if(!result) return res.json({ 
            error: 'could not update', 
            '_id': _id 
          })
        else{
          res.json({ result: 'successfully updated', '_id': _id });
        }
      });
      
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      
      const { _id } = req.body;

      if(!_id) return res.json({ error: 'missing _id' });

      issueSchema.findByIdAndDelete(_id, (err, result) => {
        if(err) console.log(err);
        if(!result) return res.json({ error: 'could not delete', '_id': _id });
        res.json({ result: 'successfully deleted', '_id': _id });
      })

    });
    
};
