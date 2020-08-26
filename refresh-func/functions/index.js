const functions = require('firebase-functions');
var admin = require("firebase-admin");
var serviceAccount = require("/Users/User/Desktop/refresh-24c1c-firebase-adminsdk-95x8z-86f7b37b0a.json");
const express = require('express');
const app = express();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://refresh-24c1c.firebaseio.com"
});

const config = {
	apiKey: "AIzaSyBd-9DQCHgplknl1XuQCNp5rFadtpsHUpk",
    authDomain: "refresh-24c1c.firebaseapp.com",
    databaseURL: "https://refresh-24c1c.firebaseio.com",
    projectId: "refresh-24c1c",
    storageBucket: "refresh-24c1c.appspot.com",
    messagingSenderId: "432993867097",
    appId: "1:432993867097:web:b619696cb58a952794a848"
};

const firebase = require('firebase');
firebase.initializeApp(config);

const db = admin.firestore();

app.get('/screams', (req, res) => {
	db.collection('screams').orderBy('createdAt', 'desc').get()
		.then(data => {
			let screams = [];
			data.forEach(doc => {
				screams.push({
					screamId: doc.id,
					body: doc.data().body,
					userHandle: doc.data().userHandle,
					createdAt: doc.data().createdAt
				});
			});
			return res.json(screams);
		})
		.catch((err) => console.error(err));
});

const FBAuth = (req, res, next) => {
	let idToken;
	if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
		idToken = req.headers.authorization.split('Bearer ')[1];
	} else {
		console.error('No token found')
		return res.status(403).json({ error: 'Unauthorized'});
	}

	admin.auth().verifyIdToken(idToken)
		.then(decodedToken => {
			req.user = decodedToken;
			return db.collection('users').where('userId', '==', req.user.uid).limit(1).get();
		})
		.then((data) => {
			req.user.handle = data.docs[0].data().handle;
			return next();
		})
		.catch(err => {
			console.error('Error whiel verifying token');
			return res.status(403).json(err);
		}) 

}

app.post('/scream', FBAuth ,(req, res) => {
  if (req.body.body.trim() === '') {
  	return res.status(400).json( { body: 'Must not be empty'});
  }
  const newScream = {
		body: req.body.body,
		userHandle: req.user.handle,
		createdAt: new Date().toISOString()
	};

	db.collection('screams').add(newScream).then(doc => {
		res.json({ message: `document ${doc.id} created successfully`});
		return console.log("success");
	})
	.catch(err => {
		res.status(500).json({ error: 'something went wrong'});
		console.error(err);
	})
});
//helper function
const isEmail = (email) => {
	const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if(email.match(emailRegEx)) return true;
	else return false;
}

const isEmpty = (string) => {
	if(string.trim() === '') return true;
	else return false;
}

//signup route
app.post('/signup', (req,res) => {
	const newUser = {
		email: req.body.email,
		password: req.body.password,
		confirmPassword: req.body.confirmPassword,
		handle: req.body.handle,
	};
let errors = {};
if(isEmpty(newUser.email)) {
	errors.email = 'Must not be empty'
}
else if(!isEmail(newUser.email)){
	errors.email = 'Must be a valid email address'
}

if(isEmpty(newUser.password)) {
	errors.password = 'Must not be empty'
}
if(newUser.password !== newUser.confirmPassword) {
	errors.confirmPassword = 'Passwords much match'
}
if(isEmpty(newUser.handle)) {
	errors.handle = 'Must not be empty'
}

if(Object.keys(errors).length > 0) return res.status(400).json(errors);

//TODO: validate data
let token, userID;
db.doc(`/users/${newUser.handle}`).get()
	.then(doc => {
		if(doc.exists) {
			return res.status(400).json({ handle: 'this handle is already taken'});
		} else {
				return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
		}
	})
	.then((data) => {
		userId = data.user.uid;
		return data.user.getIdToken();
	})
	.then((idToken) => {
		token = idToken;
		const userCredentials = {
			handle: newUser.handle,
			email: newUser.email,
			createdAt: new Date().toISOString(),
			userId
		};
		db.doc(`/users/${newUser.handle}`).set(userCredentials);
	})
	.then(() => {
		return res.status(201).json({ token});
	})
	.catch((err) => {
		console.error(err);
		if(err.code === 'auth/email-already-in-use') {
			return res.status(400).json({ email: 'Email is already in use'});
		} else {
			return res.status(500).json({ error: err.code});
		}
	});
});

app.post('/login', (req, res) => {
	const user = {
		email: req.body.email,
		password: req.body.password
	};

	let errors = {};

	if(isEmpty(user.email)) errors.email = 'Must not be empty';
	if(isEmpty(user.password)) errors.email = 'Must not be empty';

	if(Object.keys(errors).length > 0) return res.status(400).json(errors);

	firebase.auth().signInWithEmailAndPassword(user.email, user.password)
		.then((data) => {
			return data.user.getIdToken();
		})
		.then((token) => {
			return res.json({token});

		})
		.catch((err) => {
			console.error(err);
			if(err.code === "auth/wrong-password") {
				return res.status(403).json({ general: 'Wrong credentials please try again'});
			}
			else return res.status(500).json({error: err.code});
		})

})
exports.api = functions.https.onRequest(app);