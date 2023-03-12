const mongoose = require('mongoose');
const Schema=mongoose.Schema
const { Snowflake } = require('@theinternetfolks/snowflake');

const UserSchema = new Schema({
    _id: { type: String, default: () => Snowflake.generate().toString() },
    name: { type: String,required:true, minlength:2 },
    email: { type: String,required:true, unique: true },
    password: { type: String,required:true, minlength:6},
    created_at: { type: Date, default: Date.now }
  });

  const User = mongoose.model('User', UserSchema);

  module.exports=User