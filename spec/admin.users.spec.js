/* global it */
const expect = require('chai').expect
const Role = require('../models/role')
const supertest = require('supertest')
const User = require('../models/user')
const Card = require('../models/card')
const Admin = require('../models/admin')
const secret = require('../secret/key')
const Requested = require('../models/requested')
const request = supertest('http://localhost:3000')
const async = require('async')
const jwt = require('jsonwebtoken')

module.exports = () => {
  it('Superuser create admin with valid data', function(done) {
    this.timeout(3000)
    async.waterfall([
      (callback) => {
        Role.create({ name: 'SuperUser' }, (err, value) => {
          callback(null, value._id)
        })
      },
      (roleID, callback) => {
        Admin.create({ email: 'test123@gmail.com', password: '123456789', role: roleID }, (err, admin) => {
          const token = jwt.sign({
            _id: admin._id,
            email: admin.email,
            role: admin.role,
          }, secret.secretKey, {
            expiresIn: '7d',
          })
          callback(null, roleID, admin, token)
        })
      }
    ], (err, roleID, admin, token) => {
      request
        .post('/admin/createAdmin')
        .set('AccessToken', token)
        .send({
          email: 'nhatndm1193@gmail.com',
          password: '123456789',
          role: roleID
        })
        .end((err, res) => {
          if (err) done(err)
          expect(res.status).to.equal(201)
          done()
        })
    })
  })

  it('User can not create admin without role superuser', function(done) {
    this.timeout(3000)
    async.waterfall([
      (callback) => {
        Role.create({ name: 'Admin' }, (err, value) => {
          callback(null, value._id)
        })
      },
      (roleID, callback) => {
        Admin.create({ email: 'test123@gmail.com', password: '123456789', role: roleID }, (err, admin) => {
          const token = jwt.sign({
            _id: admin._id,
            email: admin.email,
            role: admin.role,
          }, secret.secretKey, {
            expiresIn: '7d',
          })
          callback(null, roleID, admin, token)
        })
      }
    ], (err, roleID, admin, token) => {
      request
        .post('/admin/createAdmin')
        .set('AccessToken', token)
        .send({
          email: 'nhatndm1193@gmail.com',
          password: '123456789',
          role: roleID
        })
        .end((err, res) => {
          if (err) done(err)
          expect(res.status).to.equal(401)
          done()
        })
    })
  })

  it('Admin can deactive user', function(done) {
    this.timeout(3000)
    async.waterfall([
      (callback) => {
        Card.create({ name: 'the bac' }, (err, value) => {
          callback(null, value._id)
        })
      },
      (cardSavedID, callback) => {
        User.create({
          provider: {
            name: 'facebook',
            info: 'nhatndm1193@gmail.com'
          },
          dealCards: [cardSavedID]
        }, (err, user) => {
          callback(null, user._id)
        })
      },
      (userID, callback) => {
        Role.create({ name: 'Admin' }, (err, value) => {
          callback(null, userID, value._id)
        })
      },
      (userID, roleID, callback) => {
        Admin.create({ email: 'test123@gmail.com', password: '123456789', role: roleID }, (err, admin) => {
          const token = jwt.sign({
            _id: admin._id,
            email: admin.email,
            role: admin.role,
          }, secret.secretKey, {
            expiresIn: '7d',
          })
          callback(null, userID, token)
        })
      }
    ], (err, userID, token) => {
      request
        .get(`/admin/user/setstatus?id=${userID}&&status=Deactivate`)
        .set('AccessToken', token)
        .end((err, res) => {
          if (err) done(err)
          expect(res.status).to.equal(201)
          expect(res.body.status).to.include('Deactivate')
          done()
        })
    })
  })

  it('Admin can not deactive user if token is unvalid', function(done) {
    this.timeout(3000)
    async.waterfall([
      (callback) => {
        Card.create({ name: 'the bac' }, (err, value) => {
          callback(null, value._id)
        })
      },
      (cardSavedID, callback) => {
        User.create({
          provider: {
            name: 'facebook',
            info: 'nhatndm1193@gmail.com'
          },
          dealCards: [cardSavedID]
        }, (err, user) => {
          callback(null, user._id)
        })
      },
      (userID, callback) => {
        Role.create({ name: 'Admin' }, (err, value) => {
          callback(null, userID, value._id)
        })
      },
      (userID, roleID, callback) => {
        Admin.create({ email: 'test123@gmail.com', password: '123456789', role: roleID }, (err, admin) => {
          const token = jwt.sign({
            _id: admin._id,
            email: admin.email,
            role: admin.role,
          }, secret.secretKey, {
            expiresIn: '7d',
          })
          callback(null, userID, token)
        })
      }
    ], (err, userID) => {
      request
        .get(`/admin/user/setstatus?id=${userID}&&status=Deactivate`)
        .set('AccessToken', 'asdasdadasdasdasdasdsad')
        .end((err, res) => {
          if (err) done(err)
          expect(res.status).to.equal(403)
          done()
        })
    })
  })

  it('Admin can get list user', function(done) {
    this.timeout(3000)
    async.waterfall([
      (callback) => {
        Card.create({ name: 'the bac' }, (err, value) => {
          callback(null, value._id)
        })
      },
      (cardSavedID, callback) => {
        User.create({
          provider: {
            name: 'facebook',
            info: 'nhatndm1193@gmail.com'
          },
          dealCards: [cardSavedID]
        }, () => {
          callback(null, cardSavedID)
        })
      },
      (cardSavedID, callback) => {
        User.create({
          provider: {
            name: 'facebook',
            info: 'nhatdmdmdmdm@gmail.com'
          },
          dealCards: [cardSavedID]
        }, () => {
          callback(null, cardSavedID)
        })
      },
      (cardSavedID, callback) => {
        Role.create({ name: 'Admin' }, (err, value) => {
          callback(null, value._id)
        })
      },
      (roleID, callback) => {
        Admin.create({ email: 'test123@gmail.com', password: '123456789', role: roleID }, (err, admin) => {
          const token = jwt.sign({
            _id: admin._id,
            email: admin.email,
            role: admin.role,
          }, secret.secretKey, {
            expiresIn: '7d',
          })
          callback(null, token)
        })
      }
    ], (err, token) => {
      request
        .get('/admin/users')
        .set('AccessToken', token)
        .end((err, res) => {
          if (err) done(err)
          expect(res.status).to.equal(200)
          expect(res.body.users.length).to.equal(2)
          done()
        })
    })
  })

  it('Admin can not get list user if token is unvalid', function(done) {
    this.timeout(3000)
    async.waterfall([
      (callback) => {
        Card.create({ name: 'the bac' }, (err, value) => {
          callback(null, value._id)
        })
      },
      (cardSavedID, callback) => {
        User.create({
          provider: {
            name: 'facebook',
            info: 'nhatndm1193@gmail.com'
          },
          dealCards: [cardSavedID]
        }, () => {
          callback(null, cardSavedID)
        })
      },
      (cardSavedID, callback) => {
        User.create({
          provider: {
            name: 'facebook',
            info: 'nhatdmdmdmdm@gmail.com'
          },
          dealCards: [cardSavedID]
        }, () => {
          callback(null, cardSavedID)
        })
      },
      (cardSavedID, callback) => {
        Role.create({ name: 'Admin' }, (err, value) => {
          callback(null, value._id)
        })
      },
      (roleID, callback) => {
        Admin.create({ email: 'test123@gmail.com', password: '123456789', role: roleID }, (err, admin) => {
          const token = jwt.sign({
            _id: admin._id,
            email: admin.email,
            role: admin.role,
          }, secret.secretKey, {
            expiresIn: '7d',
          })
          callback(null, token)
        })
      }
    ], () => {
      request
        .get('/admin/users')
        .set('AccessToken', 'sdasdasdasdasdasdasdasdasdsadasdasd')
        .end((err, res) => {
          if (err) done(err)
          expect(res.status).to.equal(403)
          done()
        })
    })
  })

  it('Admin can search user', function(done) {
    this.timeout(3000)
    async.waterfall([
      (callback) => {
        Card.create({ name: 'the bac' }, (err, value) => {
          callback(null, value._id)
        })
      },
      (cardSavedID, callback) => {
        User.create({
          provider: {
            name: 'facebook',
            info: 'nhatndm1193@gmail.com'
          },
          dealCards: [cardSavedID],
        }, () => {
          callback(null, cardSavedID)
        })
      },
      (cardSavedID, callback) => {
        User.create({
          provider: {
            name: 'facebook',
            info: 'nhatdmdmdmdm@gmail.com'
          },
          dealCards: [cardSavedID]
        }, () => {
          callback(null, cardSavedID)
        })
      },
      (cardSavedID, callback) => {
        Role.create({ name: 'Admin' }, (err, value) => {
          callback(null, value._id)
        })
      },
      (roleID, callback) => {
        Admin.create({ email: 'test123@gmail.com', password: '123456789', role: roleID }, (err, admin) => {
          const token = jwt.sign({
            _id: admin._id,
            email: admin.email,
            role: admin.role,
          }, secret.secretKey, {
            expiresIn: '7d',
          })
          callback(null, token)
        })
      }
    ], (err, token) => {
      request
        .post('/admin/user/search')
        .set('AccessToken', token)
        .send({
          search: {
            provider: {
              name: 'facebook'
            },
          }
        })
        .end((err, res) => {
          if (err) done(err)
          expect(res.status).to.equal(200)
          expect(res.body.users.length).to.equal(2)
          done()
        })
    })
  })

  it('Admin can not search user without token', function(done) {
    this.timeout(3000)
    async.waterfall([
      (callback) => {
        Card.create({ name: 'the bac' }, (err, value) => {
          callback(null, value._id)
        })
      },
      (cardSavedID, callback) => {
        User.create({
          provider: {
            name: 'facebook',
            info: 'nhatndm1193@gmail.com'
          },
          dealCards: [cardSavedID]
        }, () => {
          callback(null, cardSavedID)
        })
      },
      (cardSavedID, callback) => {
        User.create({
          provider: {
            name: 'facebook',
            info: 'nhatdmdmdmdm@gmail.com'
          },
          dealCards: [cardSavedID]
        }, () => {
          callback(null, cardSavedID)
        })
      },
      (cardSavedID, callback) => {
        Role.create({ name: 'Admin' }, (err, value) => {
          callback(null, value._id)
        })
      },
      (roleID, callback) => {
        Admin.create({ email: 'test123@gmail.com', password: '123456789', role: roleID }, (err, admin) => {
          jwt.sign({
            _id: admin._id,
            email: admin.email,
            role: admin.role,
          }, secret.secretKey, {
            expiresIn: '7d',
          })
          callback(null)
        })
      }
    ], () => {
      request
        .post('/admin/user/search')
        .set('AccessToken', 'sdasdasdasdasdsasdsadas')
        .send({
          search: {
            'provider.name': 'facebook',
          }
        })
        .end((err, res) => {
          if (err) done(err)
          expect(res.status).to.equal(403)
          done()
        })
    })
  })

  it('Admin can get list user requested card', function(done) {
    this.timeout(3000)
    async.waterfall([
      (callback) => {
        Card.create({ name: 'the bac' }, (err, value) => {
          callback(null, value._id)
        })
      },
      (cardSavedID, callback) => {
        User.create({
          provider: {
            name: 'facebook',
            info: 'nhatndm1193@gmail.com'
          }
        }, (err, user) => {
          callback(null, cardSavedID, user._id)
        })
      },
      (cardSavedID, userID, callback) => {
        Requested.create({
          userID: userID,
          cardID: cardSavedID
        }, () => {
          callback(null, cardSavedID)
        })
      },
      (cardSavedID, callback) => {
        User.create({
          provider: {
            name: 'facebook',
            info: 'nhatdmdmdmdm@gmail.com'
          }
        }, (err, user) => {
          callback(null, cardSavedID, user._id)
        })
      },
      (cardSavedID, userID, callback) => {
        Requested.create({
          userID: userID,
          cardID: cardSavedID
        }, () => {
          callback(null)
        })
      },
      (callback) => {
        Role.create({ name: 'Admin' }, (err, value) => {
          callback(null, value._id)
        })
      },
      (roleID, callback) => {
        Admin.create({ email: 'test123@gmail.com', password: '123456789', role: roleID }, (err, admin) => {
          let token = jwt.sign({
            _id: admin._id,
            email: admin.email,
            role: admin.role,
          }, secret.secretKey, {
            expiresIn: '7d',
          })
          callback(null, token)
        })
      }
    ], (err, token) => {
      request
        .get('/admin/users/requestedCard')
        .set('AccessToken', token)
        .end((err, res) => {
          if (err) done(err)
          expect(res.body.users.length).to.equal(2)
          expect(res.status).to.equal(200)
          done()
        })
    })
  })

  it('Admin can not get list user requested card without token', function(done) {
    this.timeout(3000)
    async.waterfall([
      (callback) => {
        Card.create({ name: 'the bac' }, (err, value) => {
          callback(null, value._id)
        })
      },
      (cardSavedID, callback) => {
        User.create({
          provider: {
            name: 'facebook',
            info: 'nhatndm1193@gmail.com'
          }
        }, (err, user) => {
          callback(null, cardSavedID, user._id)
        })
      },
      (cardSavedID, userID, callback) => {
        Requested.create({
          userID: userID,
          cardID: cardSavedID
        }, () => {
          callback(null, cardSavedID)
        })
      },
      (cardSavedID, callback) => {
        User.create({
          provider: {
            name: 'facebook',
            info: 'nhatdmdmdmdm@gmail.com'
          }
        }, (err, user) => {
          callback(null, cardSavedID, user._id)
        })
      },
      (cardSavedID, userID, callback) => {
        Requested.create({
          userID: userID,
          cardID: cardSavedID
        }, () => {
          callback(null)
        })
      },
      (callback) => {
        Role.create({ name: 'admin' }, (err, value) => {
          callback(null, value._id)
        })
      },
      (roleID, callback) => {
        Admin.create({ email: 'test123@gmail.com', password: '123456789', role: roleID }, (err, admin) => {
          jwt.sign({
            _id: admin._id,
            email: admin.email,
            role: admin.role,
          }, secret.secretKey, {
            expiresIn: '7d',
          })
          callback(null)
        })
      }
    ], () => {
      request
        .get('/admin/users/requestedCard')
        .set('AccessToken', 'ASDASDASDASDASDASDASD')
        .end((err, res) => {
          if (err) done(err)
          expect(res.status).to.equal(403)
          done()
        })
    })
  })
}
