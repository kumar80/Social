const express = require("express");
const app = express();
const bodyParser = require('body-parser')
const PORT = process.env.PORT || 8080;
const jsonParser = bodyParser.json()

const { createPost,getPosts,comment,likeScream,unlikeScream} = require("./handlers/screams.js");


app.post("/post", jsonParser, createPost); 
app.get("/getposts",getPosts);
app.post("/scream/:screamId/comment",jsonParser,comment);
app.get("/scream/:screamId/like", jsonParser,likeScream)
app.get("/scream/:screamId/like", jsonParser,unlikeScream)

app.listen(PORT, () => {
  console.log("Listening on port ", PORT, "!");
});
