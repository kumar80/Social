const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  jwtKey,
  jwtExpirySeconds
} = require("./config");

const schemaScream = new mongoose.Schema({
  body: String,
  handle: String,
  createdAt: String,
  commentCount: Number,
  likeCount: Number,
  avatar: String,
});

const schemaComment = new mongoose.Schema({
  body: String,
  createdAt: String,
  handle: String,
  screamId: String,
  avatar: String,
  notificationId: String,
});

const schemaLikes = new mongoose.Schema({
  handle: String,
  createdAt: String,
  screamId: String,
  notificationId: String,
});

const schemaAvatar = new mongoose.Schema({
  handle: String,
  path: String,
  fileName: String,
  userId: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
});

const schemaUser = new mongoose.Schema({
  handle: String,
  avatar: String,
  createdAt: String,
  bio: String,
  email: String,
  hash: String,
});

const schemaNotification = new mongoose.Schema({
  type: String,
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  sender: String,
  receiver: String,
});
//https://stackoverflow.com/questions/23667086/why-is-my-variable-unaltered-after-i-modify-it-inside-of-a-function-asynchron
schemaUser.methods.validatePassword = async function (password) {
  return bcrypt.compare(password, this.hash);
  //  , (err, res) => {
  //     console.log(password,this.hash);
  //       return res;
  // });
};

schemaUser.methods.generateJWT = function () {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  return jwt.sign({
      email: this.email,
      id: this._id,
      avatar: this.avatar,
      handle: this.handle,
      exp: parseInt(expirationDate.getTime() / 1000, 10),
    },
    jwtKey, {
      algorithm: "HS256",
    }
  );
};

schemaUser.methods.toAuthJSON = function () {
  return {
    _id: this._id,
    email: this.email,
    token: this.generateJWT(),
  };
};

const modelScream = mongoose.model("Screams", schemaScream);
const modelComment = mongoose.model("Comments", schemaComment);
const modelLike = mongoose.model("Likes", schemaLikes);
const modelAvatar = mongoose.model("Avatars", schemaAvatar);
const modelUser = mongoose.model("Users", schemaUser);
const modelNotification = mongoose.model("Notifications", schemaNotification);

module.exports = {
  modelScream,
  modelComment,
  modelLike,
  modelAvatar,
  modelUser,
  modelNotification,
};