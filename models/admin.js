const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')
const mongoosePaginate = require('mongoose-paginate')
const mongoosePopulate = require('mongoose-autopopulate')

let AdminSchema = mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
    autopopulate: true,
  },
  address: {
    type: String,
    lowercase: true,
  },
  phone: {
    type: String,
  },
}, {
  timestamps: true,
})


AdminSchema.pre('save', function(next) {
  let user = this
  let SALT_FACTOR = 5
  if (!user.isModified('password')) {
    return next()
  }

  bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
    if (err) {
      return next(err)
    }

    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) {
        return next(err)
      }
      user.password = hash
      next()
    })
  })
})

AdminSchema.methods.comparePassword = function(passwordAttemp, cb) {
  bcrypt.compare(passwordAttemp, this.password, (err, isMatch) => {
    if (err) {
      return cb(err)
    } else {
      cb(null, isMatch)
    }
  })
}

AdminSchema.plugin(mongoosePaginate)
AdminSchema.plugin(mongoosePopulate)

module.exports = mongoose.model('Admin', AdminSchema)
