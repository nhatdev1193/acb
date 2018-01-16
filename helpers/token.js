const secret = require('../secret/key')
const jwt = require('jsonwebtoken')
const Admin = require('../models/admin')
const User = require('../models/user')

exports.generateToken = (user) => {
  return jwt.sign(user, secret.secretKey, {
    expiresIn: '7d',
  })
}

exports.verifyAdminToken = (token, callback) => {
  jwt.verify(token, secret.secretKey, (err, decoded) => {
    if (err) {
      let error = {
        status: 403,
        data: 'Your token is unvalid, Please try login again!!!'
      }
      callback(error, null)
    }

    Admin.findById(decoded._id, (err, admin) => {
      if (err) {
        let error = {
          status: 500,
          data: 'We have got some errors, Please try again later!!!!'
        }
        callback(error, null)
      }

      if(!admin) {
        let error = {
          status: 403,
          data: 'Your token is unvalid, Please try login again!!!'
        }
        callback(error, null)
      }

      let data = {
        status: 200,
        data: admin
      }

      callback(null, data)
    })
  })
}

exports.verifyUserToken = (token, providerName, providerInfo, callback) => {
  jwt.verify(token, secret.secretKey, (err, decoded) => {
    if (err) {
      let error = {
        status: 403,
        data: 'Your token is unvalid, Please try login again!!!'
      }
      callback(error, null)
    }

    User.findOne({
      provider: {
        name: providerName,
        info: providerInfo
      }
    }, (err, user) => {
      if (err) {
        let error = {
          status: 500,
          data: 'We have got some errors, Please try again later!!!!'
        }
        callback(error, null)
      }

      if(!user) {
        let error = {
          status: 403,
          data: 'Your token is unvalid, Please try login again!!!'
        }
        callback(error, null)
      }

      if ( user.provider.name !== decoded.providerName && user.provider.info !== decoded.providerInfo ) {
        let error = {
          status: 403,
          data: 'Your token is unvalid, Please try login again!!!'
        }
        callback(error, null)
      }

      let data = {
        status: 200,
        data: user
      }

      callback(null, data)
    })
  })
}

exports.setUserAdminInfo = (user) => {
  return {
    _id: user._id,
    email: user.email,
    role: user.role,
  }
}

exports.setUserInfo = (user) => {
  return {
    providerName: user.provider.name,
    providerInfo: user.provider.info
  }
}
