const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("express-session");
const FileStore = require('session-file-store')(session);

const { modelUser } = require("./utility/admin");

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
const { ObjectId } = require("mongodb");

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
app.post("/signup", signup);
app.post("/login", login);

app.get("/authrequired", (req, res) => {
  console.log(req.isAuthenticated());
  if (req.isAuthenticated()) {
    res.send("you hit the authentication endpoint\n");
  } else {
    res.json({ err: "eeeeeeee" });
  }
});

app.use(
  session({
    genid: (req) => {
      console.log("Inside the session middleware");
      console.log(req.sessionID);
      return uuid(); // use UUIDs for session IDs
    },
    store: new FileStore(),
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
  })
);

passport.use(
  new LocalStrategy(
    { usernameField: "handle", passwordField: "password" },
    function (username, password, done) {
      console.log("use");
      modelUser.findOne({ handle: username }, function (err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        if (user.validatePassword(password)) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
      });
    }
  )
);
// tell passport how to serialize the user
passport.serializeUser((user, done) => {
  console.log("serial");
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  console.log("deserial");
  modelUser
    .findById(ObjectId(id))
    .then((res) => done(null, res.data))
    .catch((error) => done(error, false));
});
app.listen(PORT, () => {
  console.log("Listening on port ", PORT, "!");
});
