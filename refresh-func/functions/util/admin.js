var admin = require("firebase-admin");
 // export GOOGLE_APPLICATION_CREDENTIALS="/Users/User/Desktop/refresh-24c1c-firebase-adminsdk-95x8z-86f7b37b0a.json"
//var serviceAccount = require("/Users/User/Desktop/refresh-24c1c-firebase-adminsdk-95x8z-86f7b37b0a.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://refresh-24c1c.firebaseio.com",
//   storageBucket: "refresh-24c1c.appspot.com"
// });
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://refresh-24c1c.firebaseio.com",
  storageBucket: "refresh-24c1c.appspot.com"
});
const db = admin.firestore();

module.exports = { admin, db };