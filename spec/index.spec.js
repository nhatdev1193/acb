/* global describe */
const testHeplper = require('../helpers/testingDB')
const adminAuthSpec = require('./admin.auth.spec')
const adminUserSpec = require('./admin.users.spec')
const userCardApiSpec = require('./user.cards.spec')
const userSpec = require('./user.auth.spec')

describe('ACB TEST API', () => {

  testHeplper.dbHook()

  describe('User API', () => {
    userSpec()
    userCardApiSpec()
  })

  describe('Admin API', () => {
    adminAuthSpec()
    adminUserSpec()
  })
})
