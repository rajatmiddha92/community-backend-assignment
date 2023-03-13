const mongoose = require('mongoose');
const Schema=mongoose.Schema
const { Snowflake } = require('@theinternetfolks/snowflake');


const RoleSchema = new Schema({
    _id: { type: String, default: () => Snowflake.generate().toString() },
    name: { type: String,required:true, minlength: 2},
    scopes: [{type: String}],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  });

const Role = mongoose.model('Role', RoleSchema);

module.exports = Role