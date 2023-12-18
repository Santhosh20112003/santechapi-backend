// var admin = require("./configuration.js");

var decodeToken = function(req, res, next) {
  var {secret} = req.headers;

  if(secret === process.env.CLIET_SECRET){
    next();
  }
  else{
    res.status(401).json("Invalid Access Secret");
  }


  // var {token} = req.headers;
  // try {
  //   admin.auth().verifyIdToken(token)
  //     .then(function(decodedToken) {
  //       req.userdetails = decodedToken;
  //       next();
  //     })
  //     .catch(function(error) {
  //       console.error("Error verifying ID token:", error);
  //       res.status(401).json("Invalid Access Token May be Expired");
  //     });
  // } catch (error) {
  //   console.error("Error verifying ID token:", error);
  //   res.status(401).json("Invalid Access Token May be Expired");
  // }
};

module.exports = decodeToken;