const { db } = require('../util/admin');
exports.getAllScreams = (req, res) => {	

db.collection('screams').orderBy('createdAt', 'desc').get()
		.then(data => {
			let screams = [];
			data.forEach((doc) => {
				screams.push({
					screamId: doc.id,
					body: doc.data().body,
					userHandle: doc.data().userHandle,
					createdAt: doc.data().createdAt,
					commentCount: doc.data().commentCount,
					likeCount: doc.data().likeCount
				});
			});
			return res.json(screams);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).json({ error: err.code});
		});
};

exports.postOneScream = (req, res) => {
  if (req.body.body.trim() === '') {
  	return res.status(400).json( { body: 'Must not be empty'});
  }
  const newScream = {
		body: req.body.body,
		userHandle: req.user.handle,
		userImage: req.user.imageUrl,
		createdAt: new Date().toISOString(),
		likeCount: 0,
		commentCount: 0
	};

	db.collection('screams').add(newScream).then(doc => {
		const resScream = newScream;
		resScream.screamId = doc.id;
		res.json({ 
			message: `document ${doc.id} created successfully`,
			newScream
		});
		return console.log("success");
	})
	.catch(err => {
		res.status(500).json({ error: 'something went wrong'});
		console.error(err);
	});
};

exports.getScream = (req, res) => {
	let screamData = {};
	db.doc(`/screams/${req.params.screamId}`).get()
		.then(doc => {
			if(!doc.exists) {
				return res.status(404).json({error: "scream not found"});
			}
			screamData = doc.data();
			screamData.screamId = doc.id;
			return db.collection('comments').orderBy('createdAt', 'desc').where('screamId', '==', req.params.screamId).get();
		})
		.then(data => {
			screamData.comments = [];
			data.forEach(doc => {
				console.log("here");
				screamData.comments.push(doc.data());
			});
			return res.json(screamData);
		})
		.catch(err => {
		res.status(500).json({ error: 'something went wrong'});
		console.error(err);
	});

};

//comment on a scream
exports.commentOnScream = (req, res) => {
	if(req.body.body.trim() === '') return res.status(400).json({ Comment: "Must not be empty"});

	const newComment = {
		body: req.body.body,
		createdAt: new Date().toISOString(),
		screamId: req.params.screamId,
		userHandle: req.user.handle,
		userImage: req.user.imageUrl
	};

	db.doc(`/screams/${req.params.screamId}`).get()
		.then(doc => {
			if(!doc.exists) {
				return res.status(404).json({ error: "scream not found"});
			}
			return db.collection("comments").add(newComment);
		})
		.then(() => {
			return res.json(newComment);

		})
		.catch(err => {
			res.status(500).json({ error: 'something went wrong'});
			console.error(err);
		})

}