const mongoose = require('mongoose');
const issueSchema = require('../schemas/issueSchema');

const parentSchema = new mongoose.Schema({
  project: String,
  issue: [issueSchema]
});

module.exports = mongoose.model('parentSchema', parentSchema);