const functions = require('firebase-functions');
const express = require('express');
const app = express();
const FBAuth = require('./util/fbAuth');

const { db } = require('./util/admin');

const{ getAllScreams, postOneScream, getScream, commentOnScream, likeScream, unlikeScream, deleteScream } = require('./handlers/screams');
const {signup, login, uploadImage, addUserDetails, getAuthenticatedUser, getUserDetails, markNotificationRead } = require('./handlers/users');

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

//users routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);
app.get('/user/:handle', getUserDetails);
app.post('/notifications', FBAuth, markNotificationsRead);


exports.api = functions.https.onRequest(app);
exports.createNotificationOnLike = functions.firestore.document('likes/{id}').onCreate((snapshot) => {
	db.doc(`/screams/${snapshot.data().screamId}`).get()
		.then(doc => {
			if(doc.exists){
				return db.doc(`/notifications/${snapshot.id}`).set({
					createdAt: new Date().toISOString(),
					recipient: doc.data().userHandle,
					senter: snapshot.data().userHandle,
					type: 'like',
					read: 'false',
					screamId: doc.id
				})
			}
		})
		.then(() => {
			return;
		})
		.catch(err => {
			console.error(err);
			return;
		});
});

exports.deleteNotificationOnUnlike = functions.firestore.document('likes/{id}').onDelete((snapshot) => {
	db.doc(`/notifications/${snapshot.id}`).delete()
		.then(() => {
			return;
		})
		.catch(err => {
			console.error(err);
			return;
		})
});

exports.createNotificationOnComment = functions.firestore.document('comments/{id}').onCreate((snapshot) => {
	db.doc(`/screams/${snapshot.data().screamId}`).get()
		.then(doc => {
			if(doc.exists){
				return db.doc(`/notifications/${snapshot.id}`).set({
					createdAt: new Date().toISOString(),
					recipient: doc.data().userHandle,
					senter: snapshot.data().userHandle,
					type: 'comment',
					read: 'false',
					screamId: doc.id
				})
			}
		})
		.then(() => {
			return;
		})
		.catch(err => {
			console.error(err);
			return;
		});
});