const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { jwtKey, jwtExpirySeconds } = require("./config");

const schemaScream = new mongoose.Schema({
  body: String,
  userHandle: String,
  createdAt: String,
  commentCount: Number,
  likeCount: Number,
});

const schemaComment = new mongoose.Schema({
  body: String,
  createdAt: String,
  userHandle: String,
  screamId: String,
});

const schemaLikes = new mongoose.Schema({
  userHandle: String,
  createdAt: String,
  screamId: String,
});

const schemaAvatar = new mongoose.Schema({
  userId: String,
  path: String,
  fileName: String,
  userHandle: String,
  createdAt: String,
});

const schemaUser = new mongoose.Schema({
  handle: String,
  avatar: String,
  createdAt: String,
  bio: String,
  email: String,
  hash: String,
});

schemaUser.methods.validatePassword = function (password) {
  bcrypt.compare(password, this.hash, (err, res) => res);
};

schemaUser.methods.generateJWT = function () {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  return jwt.sign(
    {
      email: this.email,
      id: this._id,
      exp: parseInt(expirationDate.getTime() / 1000, 10),
    },
    jwtKey,
    {
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

module.exports = {
  modelScream,
  modelComment,
  modelLike,
  modelAvatar,
  modelUser,
};
