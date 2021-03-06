const {
  modelUser,
  modelNotification,
  modelScream,
  modelLike,
  modelUserDetails,
} = require("../utility/admin.js");
const { validateSignup, validateLogin } = require("../utility/validators.js");
const { ObjectID } = require("mongodb");

const {
  avatarDir,
  defaultAvatar,
  defaultAvatarExtension,
} = require("../utility/config");

exports.uploadImage = async (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const fs = require("fs");
  const { user } = req;
  const busboy = new BusBoy({
    headers: req.headers,
    limits: {
      files: 1,
      fileSize: 5 * 1024 * 1024,
    },
  });

  /*  
 req.on('data', function(d) {
    console.dir(''+d);
    }); 
*/
  req.pipe(busboy);
  let filePath;
  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
      return res.status(400).json({
        error: "Only jpeg / png allowed",
      });
    }
    const extension = filename.split(".")[filename.split(".").length - 1];

    filename = user.handle + "." + extension;
    filePath = path.join(avatarDir + filename);

    file.pipe(fs.createWriteStream(filePath));
  });

  busboy.on("finish", function () {
    res.status(200).json({
      message: "Uploaded!",
    });
  });
};

exports.signup = async (req, res) => {
  const bcrypt = require("bcrypt");

  const newUser = new modelUser({
    email: req.body.email,
    handle: req.body.handle,
    bio: "xxx",
    createdAt: new Date().toISOString(),
    avatar: req.body.handle + "." + defaultAvatarExtension,
  });

  const newUserDetails = new modelUserDetails({});
  const errors = {};

  const docEmail = await modelUser.findOne({
    email: newUser.email,
  });
  const docHandle = await modelUser.findOne({
    handle: newUser.handle,
  });

  if (docHandle !== null && docHandle.handle !== undefined) {
    errors.handle = "handle Already Taken";
    return res.json({ errors: errors });
  }

  if (docEmail !== null && docEmail.email !== undefined) {
    errors.email = "Email Already Taken";
    return res.json({ errors: errors });
  }

  bcrypt.hash(req.body.password, 15, (err, hash) => {
    if (err) {
      return res.status(500).json({
        error: " Something went wrong#1",
      });
    }
    const fs = require("fs");
    fs.copyFile(
      avatarDir + "/" + defaultAvatar,
      avatarDir + "/" + newUser.handle + "." + defaultAvatarExtension,
      (err) => {
        if (err) {
          return res.json({ error: "default image error" });
        }
        console.log("done");
      }
    );

    newUser.hash = hash;
    newUser
      .save()
      .then(() => {
        newUserDetails._id = newUser._id;
        newUserDetails.handle = newUser.handle;
        newUserDetails.save();
        return res.json({
          user: newUser.toAuthJSON(),
        });
      })
      .catch((err) => {
        return res.status(500).json({
          error: "Something went wrong#2",
        });
      });
  });
};

exports.getAvatar = (req, res) => {
  res.sendFile(avatarDir + "/" + `${req.params.avatar}`);
};

exports.broadcast = async (req, res) => {
  const query = [];
  const { tags, message } = req.body;
  tags.forEach((key) => {
    query.push({ [`${key}`]: true });
  });
  const data = await modelUser.find({});
  data.forEach((doc) => {
    const newNotification = modelNotification({
      type: "broadcast",
      sender: "req.user.handle",
      receiver: "doc.handle",
      message: message,
    });
    newNotification.save();
  });
  res.json({ status: "success" });
};

exports.login = (req, res, next) => {
  const passport = require("passport");

  const { body: user } = req;
  if (!user.email) {
    return res.json({
      error: {
        message: "Email is required.",
        type: "email",
      },
    });
  }

  if (!user.password) {
    return res.json({
      error: {
        message: "Password is required.",
        type: "password",
      },
    });
  }
  passport.authenticate(
    "local",
    {
      session: false,
    },
    (err, user, info) => {
      if (info) {
        return res.send(info);
      }
      // console.log(err);
      if (err) {
        return res.json({
          error: err,
        });
      }
      if (!user) {
        return res.redirect("/login");
      }
      const data = user.toAuthJSON();
      //  console.log(token);
      res.json(data);
    }
  )(req, res);
};

exports.setNotificationsRead = async (req, res) => {
  const data = await modelNotification.find({});
  return res.json({
    notifications: data,
  });
  modelNotification.update
    .query(
      {
        handle: req.user.handle,
      },
      {
        read: true,
      }
    )
    .then(() => {
      return res.json({
        notifications: data,
      });
    })
    .catch((err) => {
      return res.json({
        err: "Error",
      });
    });
};

exports.getUser = (req, res) => {
  modelUser
    .findOne({
      handle: req.params.handle,
    })
    .then((user) => {
      user.hash = "secret";
      modelScream
        .find({
          handle: req.params.handle,
        })
        .sort({
          createdAt: "desc",
        })
        .then((data) => {
          res.json({
            posts: data,
            user: user,
          });
        })
        .catch((err) => {
          return res.json({
            error: "ERRRRRRRRRRRRRRR",
          });
        });
    })
    .catch((err) => {
      return res.json({
        error: "x",
      });
    });
};

exports.getAuthUser = async (req, res) => {
  const posts = [];
  const user = await modelUser.findById(ObjectID(req.user.id));
  const postCur = modelScream
    .find({
      handle: user.handle,
    })
    .cursor();
  cursor.next.then((doc) => {
    modelLike.find({});
  });
};
///////////////////////////////////////////////////////

exports.addUserDetails = (req, res) => {
  let userDetails = reduceUserDetails(req.body);

  db.doc(`/users/${req.user.handle}`)
    .update(userDetails)
    .then(() => {
      return res.json({
        message: "Details Updated !",
      });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({
        error: err.code,
      });
    });
};

// get user details

exports.getAuthUser = (req, res) => {
  let userData = {};
  db.doc(`/users/${req.user.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        userData.credentials = doc.data();
        return db
          .collection("likes")
          .where("handle", "==", req.user.handle)
          .get();
      }
    })
    .then((data) => {
      userData.likes = [];
      data.forEach((doc) => {
        userData.likes.push(doc.data());
      });
      return db
        .collection("notifications")
        .where("recipient", "==", req.user.handle)
        .orderBy("createdAt", "desc")
        .limit(10)
        .get();
      //return res.json(userData);
    })
    .then((data) => {
      userData.notifications = [];
      data.forEach((doc) => {
        userData.notifications.push({
          recipient: doc.data().recipient,
          sender: doc.data.sender,
          screamId: doc.data.screamId,
          type: doc.data.type,
          read: doc.data.read,
          notificationsId: doc.id,
          createdAt: doc.data.createdAt,
        });
      });
      return res.json(userData);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({
        error: err,
      });
    });
};

exports.getUserDetails = (req, res) => {
  let userData = {};
  db.doc(`/users/${req.params.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        userData.user = doc.data();
        return db
          .collection("screams")
          .where("handle", "==", req.params.handle)
          .orderBy("createdAt", "desc")
          .get();
      } else
        return res.status(404).json({
          error: "user Not Found",
        });
    })
    .then((data) => {
      userData.scream = [];
      data.forEach((doc) => {
        userData.scream.push({
          body: doc.data().body,
          createdAt: doc.data().createdAt,
          userImage: doc.data().userImage,
          handle: doc.data().handle,
          likeCount: doc.data().likeCount,
          commentCount: doc.data().commentCount,
          screamId: doc.id,
        });
      });
      return res.json(userData);
    })
    .catch((err) => {
      console.error(err);
      res.status(501).json({
        error: err.code,
      });
    });
};
