const mongoose = require('mongoose');
const Schema=mongoose.Schema
const { Snowflake } = require('@theinternetfolks/snowflake');

const MemberSchema = new Schema({
    _id: { type: String, default: () => Snowflake.generate().toString() },
    community: { type: String, ref: 'Community' },
    user: { type: String, ref: 'User' },
    role: { type: String, ref: 'Role' },
    created_at: { type: Date, default: Date.now }
  });

  
const Member = mongoose.model('Member', MemberSchema);

module.exports= Member