const mongoose = require('mongoose');
const Schema=mongoose.Schema
const { Snowflake } = require('@theinternetfolks/snowflake');



const CommunitySchema = new Schema({
  _id: { type: String, default: () => Snowflake.generate().toString() },
  name: { type: String,required:true,minlength:2 },
  slug: { type: String, unique: true },
  owner: { type: String, ref: 'User' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});





const Community = mongoose.model('Community', CommunitySchema);


module.exports = Community