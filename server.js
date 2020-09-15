const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const passport = require("passport");
const { passportCallback, auth } = require("./utility/auth");
const LocalStrategy = require("passport-local").Strategy;
var cors = require('cors')

const PORT = process.env.PORT || 8080;

const {
  createPost,
  getScream,
  comment,
  likeScream,
  unlikeScream,
  deleteScream,
  feed,
  deleteComment,
} = require("./handlers/screams.js");

const {
  uploadImage,
  signup,
  login,
  getUser,
  setNotificationsRead,
  getAvatar,
  broadcast,
} = require("./handlers/users.js");

app.use(cors({origin : 'http://localhost:3000'}));
app.use(bodyParser.json());
app.use(require("morgan")("dev"));
app.use(passport.initialize());
app.use(passport.session());

app.get("/scream/:screamId", getScream);
app.get("/feed", feed);
app.get("/scream/:screamId/like",auth, likeScream);
app.get("/user/:handle",getUser);
app.get("/avatar/:avatar",getAvatar);
app.delete("/scream/:screamId/unlike", auth,unlikeScream);
app.delete("/scream/:screamId/deletecomment", auth,deleteComment);
app.delete("/scream/:screamId/delete", auth,deleteScream);

app.post("/broadcast",  broadcast);
app.post("/scream/:screamId/comment", auth,comment);
app.post("/scream",auth, createPost);
app.post("/avatar/upload", auth,uploadImage);
app.post("/signup", signup);
app.post("/login", login);
app.get("/notifications", setNotificationsRead);


passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    passportCallback
  )
);

app.listen(PORT, () => {
  console.log("Listening on port ", PORT, "!");
});
