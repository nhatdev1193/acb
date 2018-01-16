require('dotenv').config()
const mongoose = require('mongoose')
const process = require('process')
const log = require('../config/log')
const Admin = require('../models/admin')
const Card = require('../models/card')
const Role = require('../models/role')
const User = require('../models/user')
const City = require('../models/city')
const Requested = require('../models/requested')
const _ = require('lodash')
const async = require('async')
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dbName: process.env.DB_NAME,
  dbUserName: process.env.DB_USERNAME,
  dbPassword: process.env.DB_PASSWORD,
}

// Start DB
mongoose.connect(`mongodb://${dbConfig.host}:${dbConfig.port}/${dbConfig.dbName}`, {
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

connection.on('open', () => {
  connection.db.dropDatabase()
  async.waterfall([
    (callback) => {
      let cities = ['Thanh Pho Ho Chi Minh', 'Thanh Pho Ha Noi', 'Thanh Pho Da Nang', 'Thanh Pho Can Tho']
      let listCities = []
      cities.forEach((value) => {
        listCities.push(
          new Promise((resolve, reject) => {
            City.create({
              name: value
            }, (err) => {
              if (err) {
                reject(err)
              } else {
                resolve(true)
              }
            })
          })
        )
      })
      Promise.all(listCities).then(() => {
        log.print('Create Successfully Cities')
        callback(null)
      })
    },
    (callback) => {
      Role.create({
        name: 'Partner'
      }, (err, role) => {
        if (err) {
          log.printErr('Can not create Partner')
          return err
        }
        callback(null, role._id)
      })
    },
    (PartnerRoleId, callback) => {
      Role.create({
        name: 'SuperUser'
      }, (err, role) => {
        if (err) {
          log.printErr('Can not create role')
          return err
        }
        callback(null, PartnerRoleId, role._id)
      })
    },
    (PartnerRoleId, roleID, callback) => {
      Admin.create({
        email: 'nhatndm1193@gmail.com',
        password: 123456789,
        role: roleID
      }, (err) => {
        if (err) {
          log.printErr('Can not create admin')
          return err
        }

        log.print('Create Successfully Admin')
        callback(null, PartnerRoleId)
      })
    },
    (PartnerRoleId, callback) => {
      let listPartner = []
      for(let i = 0; i < 70; i ++) {
        if (i < 30) {
          listPartner.push(
            new Promise((resolve, reject) => {
              Admin.create({
                name: `ABC-Requested${i}`,
                phone: `098${i}9960299`,
                email: `nhat_Requested${i}@gmail.com`,
                password: 123456789,
                role: PartnerRoleId
              }, (err, partner) => {
                if (err) {
                  reject(err)
                } else {
                  Requested.create({
                    partnerID: partner._id,
                    status: 'Rejected'
                  }, (err) => {
                    if (err) {
                      reject(err)
                    }else {
                      resolve(true)
                    }
                  })
                }
              })
            })
          )
        }

        if (i < 50 && i >= 30) {
          listPartner.push(
            new Promise((resolve, reject) => {
              Admin.create({
                name: `ABC-Requested${i}`,
                phone: `098${i}9960299`,
                email: `nhat_Requested${i}@gmail.com`,
                password: 123456789,
                role: PartnerRoleId
              }, (err, partner) => {
                if (err) {
                  reject(err)
                } else {
                  Requested.create({
                    partnerID: partner._id,
                    status: 'Pending'
                  }, (err) => {
                    if (err) {
                      reject(err)
                    }else {
                      resolve(true)
                    }
                  })
                }
              })
            })
          )
        }

        if (i >= 50) {
          listPartner.push(
            new Promise((resolve, reject) => {
              Admin.create({
                name: `ABC-Requested${i}`,
                phone: `098${i}9960299`,
                email: `nhat_Requested${i}@gmail.com`,
                password: 123456789,
                role: PartnerRoleId
              }, (err, partner) => {
                if (err) {
                  reject(err)
                } else {
                  Requested.create({
                    partnerID: partner._id,
                    status: 'Approved'
                  }, (err) => {
                    if (err) {
                      reject(err)
                    }else {
                      resolve(true)
                    }
                  })
                }
              })
            })
          )
        }
      }
      Promise.all(listPartner).then(() => {
        log.print('Create Successfully Requested Partners')
        callback(null, PartnerRoleId)
      })
    },
    (PartnerRoleId, callback) => {
      let listPartner = []
      for(let i = 0; i < 70; i ++) {
        listPartner.push(
          new Promise((resolve, reject) => {
            Admin.create({
              name: `ABC${i}`,
              phone: `098${i}9960299`,
              email: `nhat${i}@gmail.com`,
              password: 123456789,
              role: PartnerRoleId
            }, (err, partner) => {
              if (err) {
                reject(err)
              } else {
                resolve(partner)
              }
            })
          })
        )
      }
      Promise.all(listPartner).then(() => {
        log.print('Create Successfully Partners')
        callback(null)
      })
    },
    (callback) => {
      Card.create({
        name: 'the bac',
      }, (err, card) => {
        if (err) {
          log.printErr('Can not create card')
          return err
        }
        callback(null, card._id)
      })
    },
    (cardID, callback) => {
      let listUser = []
      for(let i = 0; i < 70; i ++) {
        listUser.push(
          new Promise((resolve, reject) => {
            User.create({
              provider: {
                name: 'facebook',
                info: `test${i}`
              },
              name: `NhatDev ${i}`,
              phone: '0989960299',
              dealCards: [cardID]
            }, (err, user) => {
              if (err) {
                reject(err)
              } else {
                resolve(user)
              }
            })
          })
        )
      }
      Promise.all(listUser).then((value) => {
        log.print('Create Successfully User')
        callback(null, cardID, value)
      })
    },
    (cardID, users, callback) => {
      let listRequested = []
      _.forEach(users, (value, key) => {
        if (key <= 50) {
          listRequested.push(
            new Promise((resolve, reject) => {
              Requested.create({
                userID: value._id,
                cardID: cardID
              }, (err) => {
                if (err) {
                  reject(err)
                } else {
                  resolve(true)
                }
              })
            })
          )
        }
      })
      Promise.all(listRequested).then(() => {
        log.print('Create Successfully Requested Card')
        callback(null)
      })
    }
  ], (err) => {
    if (err) {
      log.printErr('Can not create seed data')
    }

    connection.close()
  })
})
