const { modelAvatar, modelUser } = require("../utility/admin.js");
const { validateSignup, validateLogin } = require("../utility/validators.js");

exports.uploadImage = async (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const fs = require("fs");
  const busboy = new BusBoy({
    headers: req.headers,
    limits: { files: 1, fileSize: 5 * 1024 * 1024 },
  });
  const doc = new modelAvatar({
    createdAt: new Date().toISOString(),
    userHandle: "xxxx",
    userId: "xxxx",
    fileName: "xxx",
    path: "xxxx",
  });

  const fieldData = {};
  req.pipe(busboy);

  busboy.on("field", function (
    fieldname,
    val,
    fieldnameTruncated,
    valTruncated,
    encoding,
    mimetype
  ) {
    fieldData[fieldname] = val;
  });

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
      return res.status(400).json({
        error: "Only jpeg or png allowed",
      });
    }
    const extension = filename.split(".")[filename.split(".").length - 1];
    filename = fieldData["userId"] + "." + extension;
    const filePath = path.join(__dirname, "/../uploads/" + filename);
    // doc.userId=fieldData["userId"];
    // doc.path=filePath;
    // doc.fileName=filename
    // doc.userHandle=userHandle;
    file.pipe(fs.createWriteStream(filePath));
  });

  busboy.on("finish", function () {
    res.writeHead(200, { Connection: "close" });
    res.end("Upload Succesful");
  });
};

exports.signup = async (req, res) => {
  const bcrypt = require("bcrypt");

  const newUser = new modelUser({
    email: req.body.email,
    handle: req.body.handle,
    bio: "xxx",
    createdAt: new Date().toISOString(),
    avatar: "../assets/default-avatar.png",
  });

  const doc = await modelUser.find({
    $or: [{ handle: newUser.handle }, { email: newUser.email }],
  });
  if (doc.length !== 0)
    return res.status(400).json({ error: "Handle Or Email already taken" });

  bcrypt.hash(req.body.password, 15, (err, hash) => {
    if (err) {
      return res.status(500).json({ error: " Something went wrong#1" });
    }
    newUser.hash = hash;
    newUser
      .save()
      .then(() => {
        return res.json({ user: newUser.toAuthJSON()});
      })
      .catch((err) => {
        return res.status(500).json({ error: "Something went wrong#2" });
      });
  });
};

exports.login = (req, res, next) => {
  const passport = require("passport");

  const { body: user } = req;
  if (!user.email) {
    return res.status(422).json({ error: "email is required" });
  }

  if (!user.password) {
    return res.status(422).json({ error: "password is required" });
  }
  passport.authenticate("local", (err, user, info) => {
    console.log("auth ", info);
    
    if (info) {
      return res.send(info.message);
    }
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/login");
    }
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect("/authrequired");
    });
  })(req, res);
};
// exports.signup =  (req,res)=>{

//     const newUser ={
//       password: req.body.password,
//       email : req.body.email,
//       confirmPassword : req.body.confirmPassword,
//       handle : req.body.handle
//     };
//     const {valid, errors } = validateSignup(newUser);
//       if(!valid) return res.status(400).json(errors);

//     const defaultImage =  'blank_img.png';

//     let userId,token;
//     //  validating data
//       db.doc(`/users/${newUser.handle}`).get()
//       .then(doc=>{
//         if(doc.exists) return res.status(400).json({message:`user ${newUser.handle} already exists, try another`});
//         else {
//           return  firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
//         }
//       }).then(data=>{
//         userId = data.user.uid;
//         return data.user.getIdToken();
//       }).then((xyz)=>{        // INSERT USER
//         token = xyz;
//          const userCredentials = {
//           handle : newUser.handle,
//           email : newUser.email,
//           createdAt : new Date().toISOString(),
//           imageUrl : `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${defaultImage}?alt=media`,
//           userId : userId
//         };

//         return db.doc(`/users/${newUser.handle}`).set(userCredentials);
//       })
//       .then(()=>{
//         return res.status(201).json({token});
//       })
//       .catch(err=>{
//         console.error(err);
//         if(err.code === "auth/email-already-in-use")
//         return res.json({message:`${newUser.email} already exists`});
//         else
//         return res.status(500).json({message : 'Signup Error'});
//       });

//     //  firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
//     //     .then( (data) =>{
//     //       return res.status(201).json({message :`user ${data.user.uid} created!` });
//     //     })
//     //     .catch( (err) =>{
//     //       console.error(err);
//     //       return res.status(500).json({error: err.code});
//     //     });
//     //res.send("ok");
//   }

//   exports.login  =(req,res)=> {
//     console.log(req.body);
//     const user = {
//       email : req.body.email,
//       password : req.body.password
//     };
//     const {errors,valid} = validateLogin(user);
//     if(!valid) return res.status(400).json(errors);

//     firebase.auth().signInWithEmailAndPassword(user.email,user.password)
//     .then(data => {
//       return data.user.getIdToken();
//     })
//     .then(token=>{
//       return res.json({token});
//     })
//     .catch(err=>{
//       console.error(err);
//       return res.status(500).json({error:err.code});
//     });
//   }

//   exports.addUserDetails = (req,res) => {
//     let userDetails = reduceUserDetails(req.body);

//     db.doc(`/users/${req.user.handle}`).update(userDetails)
//     .then(()=> {
//       return res.json({message : 'Details Updated !' });
//     }).catch(err => {
//       console.error(err);
//       return res.status(500).json({error : err.code});
//     });

//   }

//   // get user details

//   exports.getAuthUser = (req,res ) => {
//     let userData = {} ;
//     db.doc(`/users/${req.user.handle}`).get()
//     .then (doc => {
//       if(doc.exists){
//         userData.credentials = doc.data();
//         return db.collection('likes').where('userHandle','==',req.user.handle).get();
//       }
//     }).then(data => {
//       userData.likes = [];
//       data.forEach(doc=>{
//         userData.likes.push(doc.data());
//       });
//       return db.collection('notifications').where('recipient', '==', req.user.handle)
//       .orderBy('createdAt','desc').limit(10).get();
//       //return res.json(userData);
//     }).then(data=>{
//       userData.notifications = [];
//       data.forEach(doc=>{
//         userData.notifications.push({
//           recipient : doc.data().recipient,
//           sender : doc.data.sender,
//           screamId : doc.data.screamId,
//           type : doc.data.type,
//           read : doc.data.read,
//           notificationsId : doc.id,
//           createdAt : doc.data.createdAt
//         });
//       });
//       return res.json(userData);
//     }).catch(err=>{
//       console.error(err);
//       return res.status(500).json({error:err} );
//     })
//   }

//   exports.getUserDetails = (req, res) =>{
//     let userData = {};
//     db.doc(`/users/${req.params.handle}`).get()
//     .then(doc=>{
//       if(doc.exists){
//         userData.user = doc.data();
//         return db.collection('screams').where('userHandle','==', req.params.handle)
//         .orderBy('createdAt','desc').get();
//       } else return res.status(404).json({error:'user Not Found'});
//     }).then(data=>{
//       userData.scream = [];
//       data.forEach(doc=>{
//         userData.scream.push({
//           body : doc.data().body,
//           createdAt : doc.data().createdAt,
//           userImage : doc.data().userImage,
//           userHandle : doc.data().userHandle,
//           likeCount : doc.data().likeCount,
//           commentCount : doc.data().commentCount,
//           screamId : doc.id
//         })
//       });
//       return res.json(userData);
//     }).catch(err=>{
//       console.error(err);
//       res.status(501).json({error : err.code});
//     })
//   }

//   exports.setNotificationsRead = (req,res) =>{
//     let batch = db.batch();
//     req.body.forEach(notificationId => {
//       const notifications = db.doc(`/notifications/${notificationId}`);
//       batch.update(notifications, {read:true});
//     });
//     batch.commit()
//     .then(()=>{
//       return res.json({message : 'Notifications Read'});
//     }).catch(err=>{
//       console.error(err);
//       return res.status(501).json({error : err.code});
//     });
//   };
