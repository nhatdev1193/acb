const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const bodyParser = require('body-parser')
const ExceptionHanlder = require('../helpers/exception')
const Routes = require('./routes')

//Cors
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  res.header('Access-Control-Allow-Headers', 'Content-Type, AccessToken')
  res.header('Access-Control-Expose-Headers', 'AccessToken')
  next()
})

// Middlerware to handle JSON
app.use(bodyParser.json())

//App Routes
Routes(app)

//Exception Handler
ExceptionHanlder(app)

module.exports = server
