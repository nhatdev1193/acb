const User = require('../models/user')
const Card = require('../models/card')
const error = require('../helpers/error')
const Requested = require('../models/requested')
const _ = require('lodash')
const async = require('async')

exports.setStatusUser = (req, res, next) => {
  let statusUser = req.query.status
  let idUser = req.query.id
  User.findByIdAndUpdate(idUser, { $set: { status: statusUser } }, { new: true }, (err, user) => {
    if (err) {
      return error(500, 'We have got some errors, Pleae try again later!!!', next)
    }

    if (!user) {
      return error(422, 'Can not find this user', next)
    }

    res.status(201).send(user)
  })
}

exports.getUserInfo = (req, res, next) => {
  let idUser = req.query.id
  User.findById(idUser).exec((err, user) => {
    if (err) {
      return error(500, 'We have got some errors, Pleae try again later!!!', next)
    }

    if (!user) {
      return error(422, 'Can not find this user', next)
    }

    res.status(200).send(user)
  })
}

exports.getUsers = (req, res, next) => {
  let page = req.query.page || 1

  User.paginate({}, { page: page, limit: 10 }, (err, result) => {
    if (err) {
      return error(500, 'We have got some errors, Pleae try again later!!!!', next)
    }

    res.status(200).send({
      users: result.docs,
      pages: result.pages,
      page: result.page,
    })
  })
}

exports.searchUser = (req, res, next) => {
  let search = req.body.search
  let page = req.query.page || 1

  if (search.createdAt) {
    search.createdAt = new Date(search.createdAt).toISOString()
  }

  search = {
    'provider.name': search.provider.name || '',
    'provider.info': search.provider.info || '',
    status: search.status || '',
    createdAt: search.createdAt || ''
  }

  search = _.pickBy(search, _.identity)

  User.paginate(search, { page: page, limit: 10 }, (err, result) => {
    if (err) {
      return error(500, 'We have got some errors, Pleae try again later!!!!', next)
    }

    res.status(200).send({
      users: result.docs,
      pages: result.pages,
      page: result.page,
    })
  })
}

exports.userRequestCard = (req, res, next) => {
  let page = req.query.page || 1

  Requested.paginate({ userID: { $ne: undefined }}, { page: page, limit: 10 }, (err, result) => {
    if (err) {
      return error(500, 'We have got some errors, Pleae try again later!!!!', next)
    }
    res.status(200).send({
      users: result.docs,
      pages: result.pages,
      page: result.page,
    })
  })
}

exports.searchRequestCard = (req, res, next) => {
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

  let cardQuery = {
    name: search.requestedCard || ''
  }

  userQuery = _.pickBy(userQuery, _.identity)
  requestedQuery = _.pickBy(requestedQuery, _.identity)
  cardQuery = _.pickBy(cardQuery, _.identity)

  async.waterfall([
    (callback) => User.find(userQuery, (err, users) => callback(null, users)),
    (users, callback) => Card.find(cardQuery, (err, cards) => callback(null, users, cards))
  ],(err, users, cards) => {

    let USERS = _.map(users, (value) => value._id)
    let CARDS = _.map(cards, (value) => value._id)

    requestedQuery = _.extend(requestedQuery, { userID: { $in: USERS } , cardID: { $in: CARDS }})

    Requested.paginate(requestedQuery, { page: page, limit: 10 }, (err, result) => {
      if (err) {
        return error(500, 'We have got some errors, Pleae try again later!!!!', next)
      }
      res.status(200).send({
        users: result.docs,
        pages: result.pages,
        page: result.page,
      })
    })
  })
}

exports.setStatusCardRequest = (req, res, next) => {
  let requestedID = req.query.id
  let status = req.query.status
  let statusDefine = ['Rejected', 'Pending', 'Approved']

  if (statusDefine.indexOf(status) === - 1) {
    return error(422, 'Your information is wrong', next)
  }

  Requested.findByIdAndUpdate({ _id: requestedID }, { $set: { status: status } }, { new: true }, (err, card) => {
    if (err) {
      return error(500, 'We have got some errors, Pleae try again later!!!', next)
    }

    if (!card) {
      return error(422, 'Can not find this partner', next)
    }

    res.status(201).send(card)
  })
}
