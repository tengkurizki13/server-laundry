const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;

const encodedJson = (payload) => {
  return jwt.sign(payload, SECRET);
};

const decodedJson = (token) => {
  return jwt.verify(token, SECRET);
};

module.exports = { encodedJson, decodedJson };
