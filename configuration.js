var admin = require('firebase-admin');
// var credentials = require('./credentials.json');

const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY;

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: firebasePrivateKey.replace(/\n/g, '\n'),
    })
});

module.exports = admin;