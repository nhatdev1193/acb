const mongoose = require('mongoose')

const CardSchema = mongoose.Schema({
  name: {
    type: String,
    require: true
  },
}, {
  timestamps: true,
})

module.exports = mongoose.model('Card', CardSchema)
