const jwt = require("jsonwebtoken");
const { modelUser } = require("./admin");
const { UnauthorizedError } = require("express-jwt");
const { jwtKey, jwtExpirySeconds } = require("./config");
const bcrypt = require("bcrypt");

const passportCallback = async (username, password, done) => {
  modelUser
    .findOne({ handle: username })
    .then(async (user) => {
      if (!user) {
        return done(null, false, { message: "Incorrect username." });
      }
      const ok = await user.validatePassword(password);
      if (ok) return done(null, user);
      else return done(null, false, { message: "Incorrect Password." });
    })
    .catch((err) => {
      console.log(err);
      done(err);
    });
};

const getTokenFromHeaders = (req) => {
  const {
    headers: { authorization },
  } = req;
  if (authorization && authorization.split(" ")[0] === "Token") {
    return authorization.split(" ")[1];
  }
  return null;
};

const auth = (req, res, next) => {
  const token = getTokenFromHeaders(req);
  if (token === null)
    return res.status(401).json({ message: "UnauthorizedError" });
  var payload;
  try {
    payload = jwt.verify(token, jwtKey);
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError)
      return res.status(401).json({ error: "Unauthorized Access" });

    return res.status(400).json({ error: "unknown error" });
  }
//  console.log(payload);
  let user = {};
  user.avatar = payload.avatar;
  user.id = payload.id;
  user.email = payload.email;
  user.handle = payload.handle;
  req.user = user;
  next();
};

module.exports = { passportCallback, auth };
