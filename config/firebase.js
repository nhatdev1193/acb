const firebaseAdmin = require('firebase-admin')
const serviceAccount = require('../secret/acb-life-style-firebase-adminsdk-t39er-98dbef6319.json')

exports.initApp = () => {
  // Init AminFIREBASESDK
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL: 'https://acb-life-style.firebaseio.com'
  })

  return firebaseAdmin
}
