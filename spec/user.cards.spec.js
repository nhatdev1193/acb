/* global it */
const expect = require('chai').expect
const Card = require('../models/card')
const User = require('../models/user')
const Requested = require('../models/requested')
const supertest = require('supertest')
const request = supertest('http://localhost:3000')
const async = require('async')
const tokenHelper = require('../helpers/token')

module.exports = () => {
  it('User can not request add card that already requested', function(done) {
    this.timeout(2500)
    async.waterfall([
      (callback) => {
        Card.create({ name: 'the bac' }, (err, value) => {
          callback(null, value._id)
        })
      },
      (cardID, callback) => {
        let userInfo = tokenHelper.setUserInfo({
          provider: {
            name: 'facebook',
            info: 'test'
          }
        })
        let token = tokenHelper.generateToken(userInfo)
        User.create({
          provider: {
            name: 'facebook',
            info: 'test'
          },
          apiToken: token
        }, (err, user) => {
          callback(null, user._id, user.apiToken, cardID)
        })
      },
      (userID, token, cardID, callback) => {
        Requested.create({
          userID: userID,
          cardID: cardID
        }, () => {
          callback(null, userID, token, cardID)
        })
      },
    ], (err, userID, token, cardID) => {
      request
        .post('/api/v1/user/requestCard')
        .set('providerInfo', 'test')
        .set('providerName', 'facebook')
        .set('ApiToken', token)
        .send({
          cardID: cardID,
          userID: userID,
          name: 'ABC',
          phone: '123'
        })
        .end((err, res) => {
          if (err) done(err)
          expect(res.status).to.equal(422)
          done()
        })
    })
  })

  it('User can request add card', function(done) {
    this.timeout(2500)
    async.waterfall([
      (callback) => {
        Card.create({ name: 'the bac' }, (err, value) => {
          callback(null, value._id)
        })
      },
      (cardID, callback) => {
        let userInfo = tokenHelper.setUserInfo({
          provider: {
            name: 'facebook',
            info: 'test'
          }
        })
        let token = tokenHelper.generateToken(userInfo)
        User.create({
          provider: {
            name: 'facebook',
            info: 'test'
          },
          apiToken: token
        }, (err, user) => {
          callback(null, user._id, user.apiToken, cardID)
        })
      }
    ], (err, userID, token, cardID) => {
      request
        .post('/api/v1/user/requestCard')
        .set('providerInfo', 'test')
        .set('providerName', 'facebook')
        .set('ApiToken', token)
        .send({
          cardID: cardID,
          userID: userID,
          name: 'ABC',
          phone: '123'
        })
        .end((err, res) => {
          if (err) done(err)
          expect(res.status).to.equal(201)
          done()
        })
    })
  })
}
