const { decodedJson } = require("../helpers/webToken");
const { User } = require("../models");

const authentication = async (req, res, next) => {
  try {
    if (!req.headers.access_token) throw { name: "authentication" };
    let decoded = decodedJson(req.headers.access_token);
    let user = await User.findByPk(decoded.id);
    if (!user) throw { name: "authentication" };

    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
    };
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authentication;
