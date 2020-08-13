const functions = require('firebase-functions');
//const  config = require('./utility/config.js');


const {admin, db} = require('./utility/admin.js')

const express = require('express');
const app = express();
//Auth 
const firebaseAuth  = require('./firebaseAuth.js');
const {getAllFeed,createPost,getScream,comment,likeScream,unlikeScream,deleteScream}  = require('./handlers/screams.js');
const {signup,login,uploadImage,addUserDetails,getAuthUser,getUserDetails,setNotificationsRead}  = require('./handlers/users.js');


// output all posts
app.get('/feed',getAllFeed);
// create a post
app.post('/post', firebaseAuth, createPost);
//details of the post
app.get('/scream/:screamId', getScream) ;
//comment
app.post('/scream/:screamId/comment',firebaseAuth, comment) ;
//like & unlike
app.get('/scream/:screamId/like', firebaseAuth, likeScream);
app.get('/scream/:screamId/unlike',firebaseAuth, unlikeScream);
//delete
app.delete('/scream/:screamId', firebaseAuth, deleteScream );


//signup
app.post('/signup',signup);
//login
app.post('/login',login);
//imageUpload
app.post('/user/image',firebaseAuth, uploadImage);
//adding User Details 
app.post('/user',firebaseAuth, addUserDetails);

app.get('/user',firebaseAuth,getAuthUser); 
app.get('/user/:handle',getUserDetails);
app.post('/notifications',firebaseAuth, setNotificationsRead);
exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions
  .firestore.document('likes/{id}')
  .onCreate((snapshot) => {
    return db
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'like',
            read: false,
            screamId: doc.id
          });
        }
      })
      .catch((err) => console.error(err));
  });
exports.deleteNotificationOnUnLike = functions
  .firestore.document('likes/{id}')
  .onDelete((snapshot) => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch((err) => {
        console.error(err);
        return;
      });
  });
exports.createNotificationOnComment = functions
  .firestore.document('comments/{id}')
  .onCreate((snapshot) => {
    return db
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'comment',
            read: false,
            screamId: doc.id
          });
        }
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });

exports.onUserImageChange = functions.firestore.document('/users/{userId}')
.onUpdate(change =>{
    console.log(change.before.data());
    console.log(change.after.data());
    if(change.before.data().imageUrl!==change.after.data().imageUrl){
    let batch =db.batch();
    return db.collection('screams').where('userHandle','==',change,before.data().handle).get()
    .then((data)=>{
        data.forEach(doc=>{
            const scream =db.doc(`/screams/${doc.id}`);
            batch.update(scream, {userImage : change.after.data().imageUrl});
        })
    })
    } else return true;
})

exports.onScreamDelete = functions.firestore.document('/users/{userId}')
    .onDelete((snapshot ,context)=> {
            const screamId = context.params.screamId;
            const batch = db.batch();
            return db.collection('comments').where('screamId','===',screamId).get()
            .then(data=>{
                data.forEach(doc=>{
                    batch.delete(db.doc(`/comments/${doc.id}`));
                })
                return db.collection('likes').where('screamId','==',screamId).get();
            }) .then(data=>{
                data.forEach(doc=>{
                    batch.delete(db.doc(`/likes/${doc.id}`));
                })
                return db.collection('notifications').where('screamId','==',screamId).get();
            })  .then(data=>{
                data.forEach(doc=>{
                    batch.delete(db.doc(`/notifications/${doc.id}`));
                })
                return batch.commit();
            }) .catch(err=>{
                console.error(err);
                return true;
            })
    })

    app.listen(process.env.PORT || 8080);
 