const error = require('../helpers/error')
const Admin = require('../models/admin')
const tokenHelper = require('../helpers/token')

exports.validateHeader = (req, res, next) => {
  const token = req.get('AccessToken')

  if (!token) {
    return error(403, 'Unauthorized, Please login first!!!', next)
  }

  if (token) {
    tokenHelper.verifyAdminToken(token, (err, data) => {
      if (err) {
        return error(err.status, err.data, next)
      }

      req.admin = data.data
      next()
    })
  }
}

exports.checkRole = (roles) => {
  return (req, res , next) => {
    let admin = req.admin
    Admin.findOne(admin._id).exec((err, admin) => {
      if (err) {
        return error(500, 'We have got some errors, Pleae try again later!!!!', next)
      }

      if (roles.indexOf(admin.role.name) > -1) {
        return next()
      }

      return error(401, 'You are not authorized to view this content', next)
    })
  }
}

exports.createUser = (req, res, next) => {
  let email = req.body.email
  let password = req.body.password
  let role = req.body.role

  if (!email && !password) {
    return error(422, 'Please check your information before creating account', next)
  }

  Admin.findOne({ email: email}, (err, admin) => {
    if (err) {
      return error(500, 'We have got some errors, Pleae try again later!!!!', next)
    }

    if (admin) {
      return error(422, 'This email has been registered, Please use your another email', next)
    }

    let adminNew = new Admin({
      email: email,
      password: password,
      role: role
    })

    adminNew.save((err) => {
      if (err) {
        return error(500, 'We have got some errors, Pleae try again later!!!!', next)
      }

      res.status(201).send('Successfully created admin')
    })
  })
}

exports.login = (req, res, next) => {
  let email = req.body.email
  let password = req.body.password

  Admin.findOne({ email: email }, (err, admin) => {
    if (err) {
      return error(500, 'We have got some errors, Pleae try again later!!!!', next)
    }

    if (!admin) {
      return error(403, 'Unknown user, please sign-up first', next)
    }

    admin.comparePassword(password, (err, isMatch) => {
      if (err) {
        return error(500, 'We have got some errors, Pleae try again later!!!!', next)
      }

      if (!isMatch) {
        return error(403, 'Wrong password, please login again', next)
      }

      const adminInfo = tokenHelper.setUserAdminInfo(admin)
      res.header('AccessToken', tokenHelper.generateToken(adminInfo))
      res.status(200).json(adminInfo)
    })
  })
}

