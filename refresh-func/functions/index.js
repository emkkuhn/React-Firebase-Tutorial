const functions = require('firebase-functions');
const express = require('express');
const app = express();


const FBAuth = require('./util/fbAuth');

const{ getAllScreams, postOneScream, getScream, commentOnScream, likeScream, unlikeScream, deleteScream } = require('./handlers/screams');
const {signup, login, uploadImage, addUserDetails, getAuthenticatedUser } = require('./handlers/users');

// const config = {
// 	apiKey: "AIzaSyBd-9DQCHgplknl1XuQCNp5rFadtpsHUpk",
//     authDomain: "refresh-24c1c.firebaseapp.com",
//     databaseURL: "https://refresh-24c1c.firebaseio.com",
//     projectId: "refresh-24c1c",
//     storageBucket: "refresh-24c1c.appspot.com",
//     messagingSenderId: "432993867097",
//     appId: "1:432993867097:web:b619696cb58a952794a848"
// };

// const firebase = require('firebase');
// firebase.initializeApp(config);

//scream routes
app.get('/screams', getAllScreams);
app.post('/scream', FBAuth , postOneScream);
app.get('/scream/:screamId', getScream);
app.post('/scream/:screamId/comment', FBAuth, commentOnScream);
app.get('/scream/:screamId/like', FBAuth, likeScream);
app.get('/scream/:screamId/unlike', FBAuth, unlikeScream);
app.delete('/scream/:screamId', FBAuth, deleteScream);
//TODO delete scream

//users routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);


exports.api = functions.https.onRequest(app);