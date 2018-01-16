require('dotenv').config()
const process = require('process')
const log = require('../config/log')
const db = require('./database')
const server = require('./server')

// Start DB
db.startDB()

// Start Server
server.listen(process.env.PORT, process.env.HOST, (err) => {
  if (err) return log.printErr(err)
  log.print(`Server is running at port ${process.env.PORT}`)  
})

