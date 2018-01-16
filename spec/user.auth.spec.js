/* global it */
const expect = require('chai').expect
const Card = require('../models/card')
const supertest = require('supertest')
const request = supertest('http://localhost:3000')
const async = require('async')

module.exports = () => {
  it('Create user with valid data', function(done) {
    this.timeout(2500)
    async.waterfall([
      (callback) => {
        Card.create({ name: 'the bac' }, (err, value) => {
          callback(null, value)
        })
      },
    ], (err, cardSaved) => {
      request
        .post('/api/v1/user/signup')
        .send({
          provider: {
            name: 'facebook',
            info: 'nhatndm1193@gmail.com'
          },
          dealCards: [cardSaved._id],
        })
        .end((err, res) => {
          if (err) done(err)
          expect(res.status).to.equal(201)
          done()
        })
    })
  })

  it('Can not create user with un-valid data', function(done) {
    this.timeout(2500)
    request
      .post('/api/v1/user/signup')
      .send({
        provider: {
          name: 'facebook',
          info: 'nhatndm1193@gmail.com'
        },
        dealCards: ['2312dsscdsdfdsfsd'],
      })
      .end((err, res) => {
        if (err) done(err)
        expect(res.status).to.equal(422)
        done()
      })
  })
}
