const mongoose = require("mongoose");

const dbURL = "mongodb://localhost/fb";
mongoose
  .connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .catch((err) => {
    console.log("!! Mongoose Connection Error !!", err);
  });

module.exports = {
  jwtKey: "my_secret_key",
  jwtExpirySeconds: 3000,
  avatarDir: "/home/maverick/Documents/Projects/Social/assets/avatars",
  defaultAvatar: "default-avatar.png",
  defaultAvatarExtension : "png",
};
