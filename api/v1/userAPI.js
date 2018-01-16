const error = require('../../helpers/error')
const User = require('../../models/user')
const Card = require('../../models/card')
const City = require('../../models/city')
const tokenHelper = require('../../helpers/token')
const Requested = require('../../models/requested')
const async = require('async')

exports.validateHeader = (req, res, next) => {
  const token = req.get('ApiToken')
  const providerName = req.get('providerName')
  const providerInfo = req.get('providerInfo')

  tokenHelper.verifyUserToken(token, providerName, providerInfo, (err, data) => {
    if (err) {
      return error(err.status, err.data, next)
    }

    req.user = data.data
    next()
  })
}

exports.fetchDataSignUp = (req, res, next) => {
  async.waterfall([
    (callback) => City.find({}, (err, cities) => callback(err, cities)),
    (cities, callback) => Card.find({}, (err, cards) => callback(err, cities, cards))
  ], (err, cities, cards) => {
    if (err) return error(500, 'We have got some errors, Pleae try again later!!!', next)
    res.status(200).send({
      cities: cities,
      cards: cards
    })
  })
}

exports.createUser = (req, res, next) => {
  let providerName = req.body.provider.name
  let providerInfo = req.body.provider.info
  let name = req.body.name || ' '
  let dealCards = req.body.dealCards

  if (!providerName && !providerInfo && !dealCards) {
    return error(422, 'Please check your information before creating account', next)
  }

  User.findOne({
    provider: {
      name: providerName,
      info: providerInfo
    }
  }, (err, user) => {
    if (err) {
      return error(500, 'We have got some errors, Pleae try again later!!!', next)
    }

    if (user) {
      res.status(201).send('Login Successfully')
    }

    if (!user) {
      let userInfo = tokenHelper.setUserInfo({
        provider: {
          name: providerName,
          info: providerInfo
        }
      })
      let token = tokenHelper.generateToken(userInfo)
      let user = new User({
        name: name,
        provider: {
          name: providerName,
          info: providerInfo
        },
        dealCards: dealCards,
        apiToken: token
      })

      user.save((err, userSaved) => {
        if (err) {
          return error(422, 'Dont have any card with this cardID', next)
        }

        res.status(201).send({
          'ApiToken': userSaved.apiToken
        })
      })
    }
  })
}

exports.requestCard = (req, res, next) => {
  let cardID = req.body.cardID
  let userID = req.body.userID
  let name = req.body.name
  let phone = req.body.phone

  if (!name && !phone) {
    return error(422, 'Your infomation is missing!!!!', next)
  }

  Requested.findOne({
    userID: userID,
    cardID: cardID
  }, (err, requested) => {
    if (err) {
      return error(500, 'We have got some errors, Pleae try again later!!!', next)
    }

    if (requested) {
      return error(422, 'You have requested this card before', next)
    }

    Requested.create({
      userID: userID,
      cardID: cardID
    }, (err) => {
      if (err) {
        return error(500, 'We have got some errors, Pleae try again later!!!', next)
      }

      User.findByIdAndUpdate(userID, { $set: { name: name, phone: phone } }, { new: true }, (err) => {
        if (err) {
          return error(500, 'We have got some errors, Pleae try again later!!!', next)
        }

        res.status(201).send('Requested Successfully')
      })
    })
  })
}
