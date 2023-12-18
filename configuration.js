var admin = require('firebase-admin');
var credentials = require('./credentials.json');

admin.initializeApp({
  credential: admin.credential.cert(credentials)
});

module.exports = admin;