'use strict';
const mongoose = require('mongoose');
const parentSchema = require('../schemas/parentSchema');
const issueFile = require('../schemas/issueSchema');
const issueSchema = new mongoose.model('issueSchema', issueFile);

module.exports = function (app) {

  app.route('/api/issues/:project')

    //the GET request should query the db after a successful POST request and serve the DATA
    //the DATA should be an ARRAY of OBJECTS of all issues for a profile
    //an OBJECT should be a single issue
    .get(function (req, res, next){

      let project = req.params.project;
      
      const { issue_title, issue_text, created_by, assigned_to, status_text, open, created_on, updated_on, _id } = req.query;

      //working on filtering issues by property; note the return should retun either the filtered result or full result
//console.log('get',req.query, req.params, req.body)
      parentSchema.findOne({project})
      .exec()
      .then(result => { 
        //if(_id){
          //return res.redirect('put')
        //}
        if(issue_title) {
          result.issue = result.issue.filter(x => x.issue_title == issue_title)
        }
        if(issue_text){
          result.issue = result.issue.filter(x => x.issue_text == issue_text)
        }
        if(created_by){
          result.issue = result.issue.filter(x => x.created_by == created_by)
        }
        if(assigned_to){
          result.issue = result.issue.filter(x => x.assigned_to == assigned_to)
        }
        if(status_text){
          result.issue = result.issue.filter(x => x.status_text == status_text)
        }
        if(open){
          result.issue = result.issue.filter(x => x.open == open)
        }
        if(created_on){
          result.issue = result.issue.filter(x => x.created_on == created_on)
        }
        if(updated_on){
          result.issue = result.issue.filter(x => x.updated_on == updated_on)
        }

        if(result){
          res.json(result.issue)
        } else{
          res.send('no issues')
        }

      })
      .catch(err => console.log(err))

    })
    
    //the POST request should take user input and save to the db and return the newly created issue object.
    .post(function (req, res){

      let project = req.params.project;

      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      if(!issue_title || !issue_text || !created_by) return res.json({ error: 'required field(s) missing' });

      const newIssue = new issueSchema({
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to || '',
        status_text: status_text || '',
        open: true,
        created_on: new Date().toISOString(),
        updated_on: new Date().toISOString()
      })

      parentSchema.findOne({project})
      .exec()
      .then(result => {

        if(!result){
          let newProfile = new parentSchema({
            project,
            issue: newIssue
          }).save().catch(err => console.log(err));
        }
        else{
          result.issue.push(newIssue);
          result.save().catch(err => console.log(err));
        }
        res.json(newIssue)

      })
      .catch(err => console.log(err))
      
    })
    
    .put(function (req, res){
      let project = req.params.project;

      const { _id, issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

console.log('req.params', req.params, req.body)

      parentSchema.findOne({project})
      .exec()
      .then(async result => {

        result.issue.filter(x => {
          if(x._id == _id){
            if(issue_title){
              x.issue_title = issue_title;
            }
            if(issue_text){
              x.issue_text = issue_text;
            }
            if(created_by){
              x.created_by = created_by;
            }
            if(assigned_to){
              x.assigned_to = assigned_to;
            }
            if(status_text){
              x.status_text = status_text;
            }
            x.updated_on = new Date().toISOString()
            res.json({
              result:"successfully updated",
              "_id": x._id
            })
          } 
        })
        
        await result.save();
      })
      .catch(err => console.log(err))
      
      console.log(3, project)
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      
      console.log(4, project)
    });
    
};
