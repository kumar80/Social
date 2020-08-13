const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const passport = require("passport");
const { passportCallback,auth} = require("./utility/auth");
const LocalStrategy = require("passport-local").Strategy;

const PORT = process.env.PORT || 8080;

const {
  createPost,
  getPosts,
  comment,
  likeScream,
  unlikeScream,
  deleteScream,
} = require("./handlers/screams.js");

const { uploadImage, signup, login } = require("./handlers/users.js");

app.use(bodyParser.json());
app.use(require("morgan")("dev"));
app.use(passport.initialize());
app.use(passport.session());

app.post("/scream", createPost);
app.get("/getscream", getPosts);
app.post("/scream/:screamId/comment", comment);
app.get("/scream/:screamId/like", likeScream);
app.get("/scream/:screamId/unlike", unlikeScream);
app.delete("/scream/:screamId/delete", deleteScream);
app.post("/avatar/upload", uploadImage);
app.post("/signup",signup);
app.post("/login", auth, login);

passport.use(
  new LocalStrategy(
    { usernameField: "handle", passwordField: "password" },
    passportCallback
  )
);

app.listen(PORT, () => {
  console.log("Listening on port ", PORT, "!");
});
