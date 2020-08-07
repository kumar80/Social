const mongoose = require("mongoose");
const dbURL = "mongodb://localhost/fb";
mongoose
  .connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .catch((err) => {
    console.log("!! Mongoose Connection Error !!", err);
  });

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
  userHandle : String,
  createdAt : String,
  screamId : String,
})

const modelScream = mongoose.model("screams", schemaScream);
const modelComment = mongoose.model("comments", schemaComment);
const modelLike = mongoose.model("likes",schemaLikes)
module.exports = { modelScream, modelComment,modelLike };
