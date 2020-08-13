const {admin, db} = require('../utility/admin.js');

const  config = require('../utility/config.js');
const {validateSignup,validateLogin,reduceUserDetails} = require('../utility/validators.js');

const firebase = require('firebase');
firebase.initializeApp(config);

exports.signup =  (req,res)=>{
  
    const newUser ={
      password: req.body.password,
      email : req.body.email,
      confirmPassword : req.body.confirmPassword,
      handle : req.body.handle
    };
    const {valid, errors } = validateSignup(newUser);
      if(!valid) return res.status(400).json(errors); 
  
    const defaultImage =  'blank_img.png';

    let userId,token;
    //  validating data
      db.doc(`/users/${newUser.handle}`).get()
      .then(doc=>{
        if(doc.exists) return res.status(400).json({message:`user ${newUser.handle} already exists, try another`});
        else {
          return  firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
        }
      }).then(data=>{
        userId = data.user.uid;
        return data.user.getIdToken();
      }).then((xyz)=>{        // INSERT USER 
        token = xyz;
         const userCredentials = {
          handle : newUser.handle,
          email : newUser.email,
          createdAt : new Date().toISOString(),
          imageUrl : `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${defaultImage}?alt=media`,
          userId : userId
        };
  
        return db.doc(`/users/${newUser.handle}`).set(userCredentials);
      })
      .then(()=>{
        return res.status(201).json({token}); 
      })
      .catch(err=>{
        console.error(err);
        if(err.code === "auth/email-already-in-use")
        return res.json({message:`${newUser.email} already exists`});
        else 
        return res.status(500).json({message : 'Signup Error'});
      }); 
  
    //  firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
    //     .then( (data) =>{
    //       return res.status(201).json({message :`user ${data.user.uid} created!` });
    //     })
    //     .catch( (err) =>{
    //       console.error(err);
    //       return res.status(500).json({error: err.code});
    //     });
    //res.send("ok");
  }

  exports.login  =(req,res)=> {
    console.log(req.body);
    const user = {
      email : req.body.email, 
      password : req.body.password
    };
    const {errors,valid} = validateLogin(user);
    if(!valid) return res.status(400).json(errors); 

    firebase.auth().signInWithEmailAndPassword(user.email,user.password)
    .then(data => {
      return data.user.getIdToken(); 
    })
    .then(token=>{
      return res.json({token});
    })
    .catch(err=>{
      console.error(err);
      return res.status(500).json({error:err.code});
    });
  }

  exports.uploadImage = (req, res) => {
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');
  
    const busboy = new BusBoy({ headers: req.headers });
  
    let imageFileName;
    let imageToBeUploaded = {};
  
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      //console.log(fieldname);console.log(filename);  console.log(encoding); console.log(mimetype);
      if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
        return res.status(400).json({ error: 'Wrong file type submitted' });
      }
      // my.image.png
      const imageExtension = filename.split('.')[filename.split('.').length - 1];
      // 645235423674523.png
      imageFileName = `${Math.round(
        Math.random()*100000000000 
      ).toString()}.${imageExtension}`;
      const filepath = path.join(os.tmpdir(), 'abc.png');
      imageToBeUploaded = { filepath, mimetype };
      file.pipe(fs.createWriteStream(filepath));
    });
    busboy.on('finish', () => {
      admin
        .storage()
        .bucket()
        .upload(imageToBeUploaded.filepath, {
          resumable: false,
          metadata: {
            metadata: {
              contentType: imageToBeUploaded.mimetype
            }
          }
        })
        .then(() => {
          const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${
            config.storageBucket
          }/o/${imageFileName}?alt=media`;
          return db.doc(`/users/${req.user.handle}`).update({ imageUrl });
        })
        .then(() => {
          return res.json({ message: 'Image uploaded successfully' });
        })
        .catch((err) => {
          console.error(err);
          return res.status(500).json({ error: err.code });
        });
    });
    busboy.end(req.rawBody);
  };

  exports.addUserDetails = (req,res) => {
    let userDetails = reduceUserDetails(req.body);

    db.doc(`/users/${req.user.handle}`).update(userDetails)
    .then(()=> {
      return res.json({message : 'Details Updated !' });
    }).catch(err => {
      console.error(err);
      return res.status(500).json({error : err.code});
    });

  }

  // get user details 

  exports.getAuthUser = (req,res ) => {
    let userData = {} ;
    db.doc(`/users/${req.user.handle}`).get()
    .then (doc => {
      if(doc.exists){
        userData.credentials = doc.data();
        return db.collection('likes').where('userHandle','==',req.user.handle).get();
      }
    }).then(data => {
      userData.likes = [];
      data.forEach(doc=>{
        userData.likes.push(doc.data());
      });
      return db.collection('notifications').where('recipient', '==', req.user.handle)
      .orderBy('createdAt','desc').limit(10).get();
      //return res.json(userData);
    }).then(data=>{
      userData.notifications = [];
      data.forEach(doc=>{
        userData.notifications.push({
          recipient : doc.data().recipient,
          sender : doc.data.sender,
          screamId : doc.data.screamId,
          type : doc.data.type,
          read : doc.data.read,
          notificationsId : doc.id,
          createdAt : doc.data.createdAt
        });  
      }); 
      return res.json(userData);
    }).catch(err=>{
      console.error(err);
      return res.status(500).json({error:err} );
    }) 
  }

  exports.getUserDetails = (req, res) =>{
    let userData = {};
    db.doc(`/users/${req.params.handle}`).get()
    .then(doc=>{
      if(doc.exists){
        userData.user = doc.data();
        return db.collection('screams').where('userHandle','==', req.params.handle)
        .orderBy('createdAt','desc').get();
      } else return res.status(404).json({error:'user Not Found'});
    }).then(data=>{
      userData.scream = [];
      data.forEach(doc=>{
        userData.scream.push({
          body : doc.data().body,
          createdAt : doc.data().createdAt,
          userImage : doc.data().userImage,
          userHandle : doc.data().userHandle,
          likeCount : doc.data().likeCount,
          commentCount : doc.data().commentCount,
          screamId : doc.id  
        })
      });
      return res.json(userData);
    }).catch(err=>{
      console.error(err);
      res.status(501).json({error : err.code});
    })
  }

  exports.setNotificationsRead = (req,res) =>{
    let batch = db.batch();
    req.body.forEach(notificationId => {
      const notifications = db.doc(`/notifications/${notificationId}`);
      batch.update(notifications, {read:true});
    });
    batch.commit()
    .then(()=>{
      return res.json({message : 'Notifications Read'});
    }).catch(err=>{
      console.error(err);   
      return res.status(501).json({error : err.code});
    });
  };