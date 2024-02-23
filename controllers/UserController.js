const { User } = require("../models");
const { Op } = require('sequelize');

class UserController {
  static async users(req, res, next) {
    try {

      let option = {
        order: [["id", "DESC"]],
        where: {
          role : 'customer',
          username: {
            [Op.iLike]: `%${req.query.search}%`
          }
        },
        attributes: {
            exclude: ["password"],
          },
      };

      let users = await User.findAll(option);


      res.status(200).json({
        message: "all users",
        data: users,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async userById(req, res, next) {
    try {
      const { id } = req.params;
      let option = {
        attributes: {
          exclude: ["password"],
        },
      };
      let user = await User.findByPk(id, option);

      if (!user) throw { name: "notFound" };

      res.status(200).json({
        message: "detail user",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async userAdd(req, res, next) {
    try {
      const {
        username,
        phoneNumber,
      } = req.body;
      

      let newUser = await User.create({
        username,
        phoneNumber,
      });

      let option = {
        attributes: {
          exclude: ["password"],
        },
      };

      let user = await User.findByPk(newUser.id,option);
  
      res.status(201).json(
        {
          message: "User has been created successfully",
          data: user,
        },
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async userDelete(req, res, next) {
    try {
      const { id } = req.params;

      if (Number(id) === 1 || Number(id) === 2) throw { name: "forbidden" };

      let user = await User.findByPk(id);

      if (!user) throw { name: "notFound" };

      await user.destroy({ where: { id } });

      res.status(200).json(
        {
          massage: `user with id ${user.id} success to delete`,
        },
      );
    } catch (error) {
      next(error);
    }
  }

  static async userUpdate(req, res, next) {
    try {
      const { id } = req.params;

      if (Number(id) === 1 || Number(id) === 2) throw { name: "forbidden" };

      const {
        username,
        phoneNumber,
      } = req.body;

      let user = await User.findByPk(id);

      if (!user) throw { name: "notFound" };

      let option = {
            where: { id }
      };

      await user.update({
        username,
        phoneNumber,
      },option);

      res.status(200).json({
        massage: `user success to update`,
      });
    } catch (error) {
      next(error);
    }
  }


}

module.exports = UserController;
