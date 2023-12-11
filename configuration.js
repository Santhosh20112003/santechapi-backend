import  admin from 'firebase-admin';
import credentials from "./credentials.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(credentials)
})

export default admin;