const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const passport = require("passport");
const { passportCallback, auth } = require("./utility/auth");
const LocalStrategy = require("passport-local").Strategy;

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
  setNotificationsRead,
} = require("./handlers/users.js");

app.use(bodyParser.json());
app.use(require("morgan")("dev"));
app.use(passport.initialize());
app.use(passport.session());

app.get("/scream/:screamId", getScream);
app.get("/feed", feed);
app.get("/scream/:screamId/like",auth, likeScream);

app.delete("/scream/:screamId/unlike", auth,unlikeScream);
app.delete("/scream/:screamId/deletecomment", auth,deleteComment);
app.delete("/scream/:screamId/delete", auth,deleteScream);

app.post("/scream/:screamId/comment", auth,comment);
app.post("/scream",auth, createPost);
app.post("/avatar/upload", uploadImage);
app.post("/signup", signup);
app.post("/login", login);
app.post("/notifications",auth, setNotificationsRead);

passport.use(
  new LocalStrategy(
    { usernameField: "handle", passwordField: "password" },
    passportCallback
  )
);

app.listen(PORT, () => {
  console.log("Listening on port ", PORT, "!");
});
