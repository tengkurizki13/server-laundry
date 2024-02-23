"use strict";
const { Model } = require("sequelize");
const { hashPassword } = require("../helpers/bcryptjs");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Request, { foreignKey: "userId" });
      User.hasMany(models.Track, { foreignKey: "userId" });
    }
  }
  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { msg: "Username sudah ada" },
        validate: {
          notEmpty: { msg: "Username Kosong" },
          notNull: { msg: "Username Kosong" },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'customer', 
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { msg: "No Whatapp sudah ada" },
        validate: {
          notEmpty: { msg: "No Whatapp Kosong" },
          notNull: { msg: "No Whatapp Kosong" },
          isValidPhoneNumber(value) {
            // Validasi nomor telepon menggunakan regular expression
            if (isNaN(value)) {
              throw new Error('Nomor telepon harus berupa angka');
            }
          },
        },
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: "customer",
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  User.beforeCreate((user, option) => {
    user.password = hashPassword(user.password);
  });
  return User;
};
