const Admin = require('../models/admin')
const Role = require('../models/role')
const error = require('../helpers/error')
const Requested = require('../models/requested')
const async = require('async')
const _ = require('lodash')

exports.getPartner = (req, res, next) => {
  let idPartner = req.query.id

  Admin.findById(idPartner).exec((err, partner) => {
    if (err) {
      return error(500, 'We have got some errors, Pleae try again later!!!', next)
    }

    if (!partner) {
      return error(422, 'Can not find this partner', next)
    }

    res.status(200).send(partner)
  })
}

exports.getPartners = (req, res, next) => {
  let page = req.query.page || 1

  Requested.paginate({ partnerID: { $ne: undefined } }, { page: page, limit: 10 }, (err, result) => {
    if (err) {
      return error(500, 'We have got some errors, Pleae try again later!!!!', next)
    }

    res.status(200).send({
      partners: result.docs,
      pages: result.pages,
      page: result.page,
    })
  })
}

exports.requestPartner = (req, res, next) => {
  let email = req.body.email
  let name = req.body.name
  let phone = req.body.phone
  let address = req.body.address

  if (!email && !name && !phone && !address) {
    return error(422, 'Your infomation is missing!!!!', next)
  }

  Admin.findOne({email: email}, (err, admin) => {
    if (err) {
      return error(500, 'We have got some errors, Pleae try again later!!!', next)
    }

    if (admin) {
      return error(422, 'This email already registered, Please try login!!!!', next)
    }

    Admin.create({
      name: name,
      email: email,
      phone: phone,
      address: address,
      password: `${name}${email}`,
      role: 'Partner'
    }, (err, adminCreated) => {
      if (err) {
        return error(500, 'We have got some errors, Pleae try again later!!!', next)
      }

      Requested.create({
        partnerID: adminCreated._id
      }, (err) => {
        if (err) {
          return error(500, 'We have got some errors, Pleae try again later!!!', next)
        }

        res.status(201).send('Requested Successfully')
      })
    })
  })
}

exports.setStatusPartnerRequest = (req, res, next) => {
  let requestedID = req.query.id
  let status = req.query.status
  let statusDefine = ['Rejected', 'Pending', 'Approved']

  if (statusDefine.indexOf(status) === - 1) {
    return error(422, 'Your information is wrong', next)
  }

  Requested.findByIdAndUpdate({ _id: requestedID }, { $set: { status: status } }, { new: true }, (err, partner) => {
    if (err) {
      return error(500, 'We have got some errors, Pleae try again later!!!', next)
    }

    if (!partner) {
      return error(422, 'Can not find this partner', next)
    }

    res.status(201).send(partner)
  })
}

exports.searchPartners = (req, res, next) => {
  let search = req.body.search
  let page = req.query.page || 1

  let userQuery = {
    name: search.name || '',
    phone: search.phone || ''
  }

  let requestedQuery = {
    status: search.status || '',
    createdAt: search.createdAt ? new Date(search.createdAt).toISOString() : ''
  }

  userQuery = _.pickBy(userQuery, _.identity)
  requestedQuery = _.pickBy(requestedQuery, _.identity)

  async.waterfall([
    (callback) => Role.findOne({ name: 'Partner'}, (err, role) => callback(err, role._id)),
    (PartnerID, callback) => {
      userQuery = _.extend(userQuery, { role: PartnerID })
      Admin.find(userQuery, (err, partners) => callback(null, partners))
    },
  ],(err, partners) => {

    let PARTNERS = _.map(partners, (value) => value._id)

    requestedQuery = _.extend(requestedQuery, { partnerID: { $in: PARTNERS }})

    Requested.paginate(requestedQuery, { page: page, limit: 10 }, (err, result) => {
      if (err) {
        return error(500, 'We have got some errors, Pleae try again later!!!!', next)
      }
      res.status(200).send({
        partners: result.docs,
        pages: result.pages,
        page: result.page,
      })
    })
  })
}
