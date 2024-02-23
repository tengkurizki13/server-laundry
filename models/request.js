"use strict";
const { Model } = require("sequelize");
// const { Ingredient } = require("../models");
module.exports = (sequelize, DataTypes) => {
  class Request extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Request.belongsTo(models.User, { foreignKey: "userId" });
      Request.hasMany(models.Track, { foreignKey: "requestId" });
    }

  }
  Request.init(
    {
      scale: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Berat Timbangan Kosong" },
          notNull: { msg: "Berat Timbangan Kosong" },
          notZero(value) {
            if (Number(value) <= 0) {
              throw new Error("Total Timbangan tidak boleh kosong atau minus");
            }
          }
        },
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Harga Kosong" },
          notNull: { msg: "Harga Kosong" },
          notZero(value) {
            if (Number(value) <= 0) {
              throw new Error("Total Harga tidak boleh kosong atau minus");
            }
          }
        },
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "proses",
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: { msg: "UserName Kosong" },
          notNull: { msg: "UserName Kosong" },
          notZero(value) {
            if (Number(value) <= 0) {
              throw new Error("Username tidak boleh Kosong");
            }
          }
        },
        references: {
          model: {
            tableName: "Users",
          },
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: "Request",
    }
  );
  return Request;
};
