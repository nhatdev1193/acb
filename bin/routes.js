const userAPI = require('../api/v1/userAPI')
const adminAuth = require('../admin/auth')
const adminUser = require('../admin/user')
const adminPartner = require('../admin/partner')
const express = require('express')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('../swagger.json')

module.exports = (app) => {
  const userRoutes = express.Router()
  const adminRoutes = express.Router()

  // Admin routes
  adminRoutes.post('/createAdmin', adminAuth.validateHeader, adminAuth.checkRole(['SuperUser']), adminAuth.createUser)
  adminRoutes.post('/login', adminAuth.login)

  // Admin CRUD for users
  adminRoutes.get('/users', adminAuth.validateHeader, adminAuth.checkRole(['SuperUser', 'Admin']), adminUser.getUsers)
  adminRoutes.get('/user', adminAuth.validateHeader, adminAuth.checkRole(['SuperUser', 'Admin']), adminUser.getUserInfo)
  adminRoutes.get('/user/setstatus', adminAuth.validateHeader, adminAuth.checkRole(['SuperUser', 'Admin']), adminUser.setStatusUser)
  adminRoutes.get('/users/requestedCard', adminAuth.validateHeader, adminAuth.checkRole(['SuperUser', 'Admin']), adminUser.userRequestCard)
  adminRoutes.get('/users/setstatuscard', adminAuth.validateHeader, adminAuth.checkRole(['SuperUser', 'Admin']), adminUser.setStatusCardRequest)
  adminRoutes.post('/user/search', adminAuth.validateHeader, adminAuth.checkRole(['SuperUser', 'Admin']), adminUser.searchUser)
  adminRoutes.post('/user/searchRequested', adminAuth.validateHeader, adminAuth.checkRole(['SuperUser', 'Admin']), adminUser.searchRequestCard)

  // Admin CRUD for partner
  adminRoutes.get('/partner', adminAuth.validateHeader, adminAuth.checkRole(['SuperUser', 'Admin']), adminPartner.getPartner)
  adminRoutes.get('/partners', adminAuth.validateHeader, adminAuth.checkRole(['SuperUser', 'Admin']), adminPartner.getPartners)
  adminRoutes.get('/partner/setstatus', adminAuth.validateHeader, adminAuth.checkRole(['SuperUser', 'Admin']), adminPartner.setStatusPartnerRequest)
  adminRoutes.post('/partner/search', adminAuth.validateHeader, adminAuth.checkRole(['SuperUser', 'Admin']), adminPartner.searchPartners)
  adminRoutes.post('/partner/requested', adminPartner.requestPartner)


  // User routes
  userRoutes.post('/user/signup', userAPI.createUser)
  userRoutes.post('/user/requestCard', userAPI.validateHeader, userAPI.requestCard)

  // User fetch data for signup
  userRoutes.get('/user/signupdata', userAPI.fetchDataSignUp)

  app.use('/admin', [adminRoutes])
  app.use('/api/v1', [userRoutes])
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
}