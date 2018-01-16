/* global it */
const expect = require('chai').expect
const Role = require('../models/role')
const supertest = require('supertest')
const Admin = require('../models/admin')
const secret = require('../secret/key')
const request = supertest('http://localhost:3000')
const async = require('async')
const jwt = require('jsonwebtoken')

module.exports = () => {
  it('User as role Admin can login to system', function(done) {
    this.timeout(3000)
    async.waterfall([
      (callback) => {
        Role.create({ name: 'SuperUser' }, (err, value) => {
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
        .post('/admin/login')
        .send({
          email: 'test123@gmail.com',
          password: '123456789'
        })
        .end((err, res) => {
          if (err) done(err)
          expect(res.status).to.equal(200)
          expect(res.headers.accesstoken).to.be.not.undefined
          done()
        })
    })
  })

  it('Normal user can not login to system', function(done) {
    this.timeout(3000)
    async.waterfall([
      (callback) => {
        Role.create({ name: 'SuperUser' }, (err, value) => {
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
        .post('/admin/login')
        .send({
          email: 'test123343434@gmail.com',
          password: '123456789'
        })
        .end((err, res) => {
          if (err) done(err)
          expect(res.status).to.equal(403)
          expect(res.headers.accesstoken).to.be.undefined
          done()
        })
    })
  })
}
