const { modelScream, modelComment, modelLike } = require("../utility/admin.js");
const { ObjectId } = require("mongodb");

exports.createPost = (req, res) => {
  
  if (req.body.body === undefined)
    return res.status(400).json({ comment: "Empty Body is not allowed" });

  const doc = new modelScream();
  doc.body = req.body.body;
  doc.userHandle = req.body.userHandle;
  doc.commentCount = 0;
  doc.likeCount = 0;
  doc.createdAt = new Date().toISOString();

  doc
    .save()
    .then(() => res.json(doc))
    .catch((err) => {
      console.log("!! createPost Error !! ", err);
    });
};

exports.getPosts = (req, res) => {
  modelScream
    .find({})
    .then((data) => res.json(data))
    .catch((err) => {
      console.log(err);
    });
};

exports.comment = async (req, res) => {
  if (req.body.body === undefined)
    return res.status(400).json({ comment: "Empty Comment is not allowed" });

  const scream = await modelScream.findById(ObjectId(req.params.screamId));

  if (scream === null)
    return res.status(400).json({ error: "Post doest not exists" });

  const newComment = new modelComment();

  newComment.body = req.body.body;
  newComment.createdAt = new Date().toISOString();
  newComment.screamId = req.params.screamId;
  newComment.userHandle = req.body.userHandle;

  newComment
    .save()
    .then(() => {
      scream.commentCount = scream.commentCount + 1;
      scream.save();
      res.json(newComment);
    })
    .catch((err) => {
      console.log("!! new Comment Error !! ", err);
    });
};

exports.likeScream = async (req, res) => {
  const scream = await modelScream.findById(ObjectId(req.params.screamId));

  if (scream === null)
    return res.status(400).json({ error: "Post doest not exists" });

  if (
    (await modelLike.findOne({
      userHandle: req.body.userHandle,
      screamId: req.params.screamId,
    })) !== null
  )
    return res.status(400).json({ error: "You have already liked the post" });

  const newLike = new modelLike();
  newLike.createdAt = new Date().toISOString();
  newLike.userHandle = req.body.userHandle;
  newLike.screamId = req.params.screamId;

  newLike
    .save()
    .then(() => {
      scream.likeCount = scream.likeCount + 1;
      scream.save();
      res.json(newLike);
    })
    .catch((err) => {
      console.log("!! new Like Error !! ", err);
    });
};

exports.unlikeScream = async (req, res) => {
  const scream = await modelScream.findById(ObjectId(req.params.screamId));

  if (scream === null)
    return res.status(400).json({ error: "Post doest not exists" });

  if (
    (await modelLike.findOne({
      userHandle: req.body.userHandle,
      screamId: req.params.screamId,
    })) === null
  )
    return res.status(400).json({ error: "Cannot unlike" });

  modelLike
    .deleteOne({
      userHandle: req.body.userHandle,
      screamId: req.params.screamId,
    })
    .then(() => {
      scream.likeCount = scream.likeCount - 1;
      scream.save();
      res.json("Unliked");
    })
    .catch((err) => {
      console.log("!! unlike Error !!", err);
    });
};

exports.deleteScream = async (req, res) => {
  const scream = await modelScream.findById(ObjectId(req.params.screamId));

  if (scream === null)
    return res.status(400).json({ error: "Post doest not exists" });

  scream.delete();

  const d1 = await modelLike.deleteMany({ screamId: req.params.screamId });
  const d2 = await modelComment.deleteMany({ screamId: req.params.screamId });

  if (d1.ok == 1 && d2.ok == 1) return res.json("Post Deleted");
  else return res.status(400).json({ error: "Error Deleting" });
};

// exports.getAllFeed  =(req, res) => {
//     admin
//       .firestore()
//       .collection('screams')
//       .orderBy('createdAt', 'desc')
//       .get()
//       .then((data) => {
//         let posts = [];
//         data.forEach((doc) => {
//           posts.push({
//             screamId: doc.id,
//             body: doc.data().body,
//             userHandle: doc.data().userHandle,
//             createdAt: doc.data().createdAt,
//              commentCount: doc.data().commentCount,
//             likeCount: doc.data().likeCount,
//             userImage  : doc.data().userImage
//           });
//         });
//         return res.json(posts);
//       })
//       .catch((err) => {
//         console.error(err);
//         res.status(500).json({ error: err.code });
//       });
//   }

//   exports.createPost = (req, res) => {
//     if (req.body.body.trim() === '') {
//       return res.status(400).json({ body: 'Body must not be empty' });
//     }

//     const newPost = {
//       body: req.body.body,
//       userHandle: req.user.handle,
//       userImage : req.user.imageUrl,
//       createdAt: new Date().toISOString(),
//       likeCount : 0,
//       commentCount : 0
//     };

//     admin
//       .firestore()
//       .collection('screams')
//       .add(newPost)
//       .then((doc) => {
//         const resScream = newPost;
//         resScream.screamId = doc.id;
//         res.json(resScream);
//       })
//       .catch((err) => {
//         res.status(500).json({ error: 'something went wrong' });
//         console.error(err);
//       });
//   }

//   exports.getScream = (req,res) =>{
//     let screamData ={};
//     //console.log(req);
//     db.doc(`/screams/${req.params.screamId}`).get()
//     .then(doc =>{
//       if(!doc.exists) return res.status(400).json({error:'Post Not Found'});

//       screamData = doc.data();
//      // console.log(screamData);
//       screamData.screamId = doc.id;
//       return db.collection('comments').
//       orderBy('createdAt','desc').where('screamId','==', req.params.screamId).get();
//     })
//     .then (data =>{
//       screamData.comments=[];
//       data.forEach(doc =>{
//         screamData.comments.push(doc.data());
//       });
//       return res.json(screamData);
//     }).catch(err => {
//       console.error(err);
//       res.status(500).json({error : err.code});
//     });
//   }

//   // commenting
//   exports.comment = (req,res) =>{
//       if(req.body.body.trim()==='') return res.status(400).json({comment :'Empty comment not allowed'});

//       const newComment = {
//          body: req.body.body,
//          createdAt : new Date().toISOString(),
//          screamId : req.params.screamId,
//          userHandle : req.user.handle,
//          userImage : req.user.imageUrl
//         };

//         db.doc(`/screams/${req.params.screamId}`).get()
//         .then(doc =>{
//           if(!doc.exists){
//             return res.status(400).json({error : 'Post doest not exists'});
//           }
//           return doc.ref.update({commentCount : doc.data().commentCount + 1});
//         })
//         .then(()=>{
//           return db.collection('comments').add(newComment);
//         })
//         .then(()=>{
//           return res.json(newComment);
//         })
//         .catch(err =>{
//           console.error(err);
//           res.status(500).json({error : 'Oops!'});
//         })
//   }

//   exports.likeScream = (req, res) => {

//     const likeDoc =db.collection('likes').where('userHandle','==', req.user.handle)
//     .where('screamId','==',req.params.screamId).limit(1);

//         const screamDoc = db.doc(`/screams/${req.params.screamId}`);
//         let screamData = {};

//         screamDoc.get()
//           .then(doc=>{
//             if(doc.exists){
//               screamData = doc.data();
//               screamData.screamId = doc.id;
//               return likeDoc.get();
//             }
//             else {
//               res.status(500).json({message : 'scream Doest Exists'});
//             }
//           })
//           .then(data => {
//             if(data.empty){
//               return db.collection('likes').add({
//                 screamId : req.params.screamId,
//                 userHandle : req.user.handle
//               }).then (()=> {
//                 screamData.likeCount++;
//                 return screamDoc.update({likeCount : screamData.likeCount});
//               }).then(()=>{
//                 return res.json(screamData);
//               })
//             }
//               else {
//                 return res.status(400).json({error : 'Cannot like twice'});
//               }
//           }).catch(err=>{
//             console.error(err);
//             return res.status(500).json({error : err.code});
//           })
//   }

//   exports.unlikeScream = (req, res)=>{

//     const likeDoc =db.collection('likes').where('userHandle','==', req.user.handle)
//     .where('screamId','==',req.params.screamId).limit(1);

//         const screamDoc = db.doc(`/screams/${req.params.screamId}`);
//         let screamData = {};

//         screamDoc.get()
//           .then(doc=>{
//             if(doc.exists){
//               screamData = doc.data();
//               screamData.screamId = doc.id;
//               return likeDoc.get();
//             }
//             else {
//               res.status(500).json({message : 'scream Doest Exists'});
//             }
//           })
//           .then(data => {
//             if(data.empty){
//               return res.status(400).json({error : 'Cannot unlike'});
//             }
//               else {
//                 console.log(data.docs[0].id);
//                 return db.doc(`/likes/${data.docs[0].id}`).delete()
//                 .then(()=>{
//                     screamData.likeCount--;
//                     return screamDoc.update({likeCount : screamData.likeCount});
//                 })
//                 .then(()=>{
//                   return res.json(screamData);
//                 })
//               }
//           }).catch(err=>{
//             console.error(err);
//             return res.status(500).json({error : err.code});
//           })
//   }

//   exports.deleteScream = (req, res) =>{
//         const post =db.doc(`/screams/${req.params.screamId}`);
//         post.get().then( doc =>{
//             if(!doc.exists) {
//               return res.status(500).json({error : 'scream not found'});
//             }
//             if(doc.data().userHandle !== req.user.handle){
//               return res.status(403).json({error :'Unauthorize'});
//             } else {
//               return post.delete();
//             }
//         })
//         .then(()=>{
//           res.json({message : 'Post delete success'});
//         })
//         .catch(err=>{
//           console.error(err);
//           res.status(500).json({error : err.code});
//         })
//   }
