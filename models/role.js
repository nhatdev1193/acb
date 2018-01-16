const mongoose = require('mongoose')

const RoleSchema = mongoose.Schema({
  name: {
    type: String,
    enum: ['SuperUser', 'Admin', 'Partner'],
    require: true
  }
}, {
  timestamps: true,
})

module.exports = mongoose.model('Role', RoleSchema)
