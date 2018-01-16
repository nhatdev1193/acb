const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate')
const mongoosePopulate = require('mongoose-autopopulate')

const RequestedSchema = mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    autopopulate: true,
    ref: 'User',
  },
  cardID : {
    type: mongoose.Schema.Types.ObjectId,
    autopopulate: true,
    ref: 'Card',
  },
  partnerID: {
    type: mongoose.Schema.Types.ObjectId,
    autopopulate: true,
    ref: 'Admin'
  },
  status: {
    type: String,
    enum: ['Rejected', 'Pending', 'Approved'],
    default: 'Pending'
  }
}, {
  timestamps: true,
})

RequestedSchema.plugin(mongoosePaginate)
RequestedSchema.plugin(mongoosePopulate)

module.exports = mongoose.model('Requested', RequestedSchema)
