const { User } = require("../models");
const { comparePassword } = require("../helpers/bcryptjs");
const { encodedJson } = require("../helpers/webToken");

class AuthController {
  static async login(req, res, next) {
    try {
      // req.body
      const { username, password } = req.body;
      
      // validation for empty username or password
      if (!username || !password  ) throw { name: "Bad Request" };

      // query findone to db
      let user = await User.findOne({
        where: { username },
      });



      // check authentication
      if (!user) throw { name: "authentication" };
      
      // check role
      if (user.role === 'customer') throw { name: "authorized" };
      // compore password hash
      let isvalidPass = await comparePassword(password, user.password);


      // check authentication
      if (!isvalidPass) throw { name: "authentication" };

      // make paylod for token
      let payload = {
        id: user.id,
      };

      //  make token
      payload = encodedJson(payload);

      // response success
      res.status(200).json(
        {
          message: "User has been logged in",
          data : {
            access_token: payload,
            role: user.role,
          }
        },
      );
    } catch (error) {
    // next error to error handler

    console.log(error);
      next(error);
    }
  }
}

module.exports = AuthController;
