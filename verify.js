var admin = require("./configuration.js");

var decodeToken = async function (req, res, next) {
  var token = req.headers.token;
  console.log();

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.userdetails = decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying ID token:", error);
    res.status(401).json("Invalid Access Token May be Expired");
  }
};

module.exports = decodeToken;
