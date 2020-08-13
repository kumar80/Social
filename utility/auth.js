const jwt = require("jsonwebtoken");
const { modelUser } = require("./admin");
const { UnauthorizedError } = require("express-jwt");
const {jwtKey,jwtExpirySeconds} = require('./config')

const passportCallback = (username, password, done) => {
  modelUser.findOne({ handle: username }).then(user=> {
    if (!user) {
      return done(null, false, { message: "Incorrect username." });
    }
    if (user.validatePassword(password)) {
      return done(null, false, { message: "Incorrect password." });
    }
    return done(null, user);
  }).catch(err=>{
    console.log(err);
    done(err);
  });
};

const getTokenFromHeaders = (req) => {
  const { headers: { authorization } } = req;
  if(authorization && authorization.split(' ')[0] === 'Token') {
    return authorization.split(' ')[1];
  }
  return null;
};

const auth = (req,res) => {
  const token = getTokenFromHeaders(req);
  if(token===null) 
    return res.status(401).json({message : "UnauthorizedError"});
  var payload ;
    try{
     payload = jwt.verify(token,jwtKey);
    }catch (err){
        if(err instanceof jwt.JsonWebTokenError) 
          return res.status(401).end();

        return res.status(400).json({error : "unknown error"});
    }
    return res.json(payload);
};

module.exports = { passportCallback ,auth};
