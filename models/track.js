'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Track extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Track.belongsTo(models.User, { foreignKey: "userId" });
      Track.belongsTo(models.Request, { foreignKey: "requestId" });
    }
  }
  Track.init({
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: { msg: "UserId is Required" },
          notNull: { msg: "UserId is Required" },
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
    requestId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: { msg: "RequestId is Required" },
          notNull: { msg: "RequestId is Required" },
        },
        references: {
          model: {
            tableName: "Requests",
          },
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "proses",
      },
  }, {
    sequelize,
    modelName: 'Track',
  });
  return Track;
};