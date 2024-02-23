"use strict";

const fs = require("fs");
const { hashPassword } = require("../helpers/bcryptjs");

let data = JSON.parse(fs.readFileSync("./data/users.json", "utf-8")).map(
  (user) => {
    user.password = hashPassword(user.password);
    user.createdAt = new Date();
    user.updatedAt = new Date();
    return user;
  }
);

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Users", data);
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", data);
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
