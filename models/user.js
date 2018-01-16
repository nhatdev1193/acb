const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate')
const mongoosePopulate = require('mongoose-autopopulate')

const UserSchema = mongoose.Schema({
  name: {
    type: String,
  },
  phone: {
    type: String,
  },
  provider: {
    name: {
      type: String,
      require: true
    },
    info: {
      type: String,
      unique: true,
      require: true
    }
  },
  ownerCards: [{
    type: mongoose.Schema.Types.ObjectId,
    autopopulate: true,
    ref: 'Card',
  }],
  dealCards: [{
    type: mongoose.Schema.Types.ObjectId,
    autopopulate: true,
    ref: 'Card',
  }],
  apiToken: {
    type: String,
  },
  point: {
    type: Number
  },
  rewardsHistory: [{
    name: {
      type: String
    },
    point: {
      type: Number
    }
  }],
  city: {
    type: mongoose.Schema.Types.ObjectId,
    autopopulate: true,
    ref: 'City',
  },
  status: {
    type: String,
    enum: ['Activate', 'Deactivate'],
    default: 'Activate'
  }
}, {
  timestamps: true,
})

UserSchema.plugin(mongoosePaginate)
UserSchema.plugin(mongoosePopulate)

module.exports = mongoose.model('User', UserSchema)
