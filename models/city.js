const mongoose = require('mongoose')

const CitySchema = mongoose.Schema({
  name: {
    type: String,
    require: true
  },
}, {
  timestamps: true,
})

module.exports = mongoose.model('City', CitySchema)
