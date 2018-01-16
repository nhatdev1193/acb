/* global before after afterEach */
require('dotenv').config()
const mongoose = require('mongoose')
const process = require('process')
const log = require('../config/log')
const server = require('../bin/server')
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dbNameTest: process.env.DB_TEST_NAME,
  dbUserName: process.env.DB_TEST_USERNAME,
  dbPassword: process.env.DB_TEST_PASSWORD,
}

// Start DB
mongoose.connect(`mongodb://${dbConfig.host}:${dbConfig.port}/${dbConfig.dbNameTest}`, {
  user: dbConfig.dbUserName,
  pass: dbConfig.dbPassword,
},(err) => {
  if (err) {
    log.printErr('Can not connect to DB. Please Check Again')
    return err
  }
  log.print('Connect Successfully To DB Server')
})
const connection = mongoose.connection

// Start Server
server.listen(process.env.PORT, process.env.HOST, (err) => {
  if (err) return log.printErr(err)
  log.print(`Server is running at port ${process.env.PORT}`)
})

exports.dbHook = () => {
  before((done) => {
    connection.on('open', () => {
      connection.db.dropDatabase(done)
    })
  })

  after((done) => {
    server.close()
    connection.close(done)
  })

  afterEach((done) => {
    connection.db.dropDatabase(done)
  })
}
