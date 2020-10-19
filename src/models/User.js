const Sequelize = require("sequelize");

module.exports = sequelize.define("User", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER
  },
  username: {
    allowNull: true,
    type: Sequelize.STRING
  },
  email: {
    allowNull: false,
    type: Sequelize.STRING
  },
  first_name: {
    allowNull: false,
    type: Sequelize.STRING
  },
  last_name: {
    allowNull: false,
    type: Sequelize.STRING
  },
  password: {
    allowNull: true,
    type: Sequelize.STRING
  },
  email_confirmation: {
    allowNull: true,
    defaultValue: false,
    type: Sequelize.BOOLEAN
  },
  google_id: {
    allowNull: true,
    type: Sequelize.STRING
  },
  createdAt: {
    allowNull: false,
    type: Sequelize.DATE
  },
  updatedAt: {
    allowNull: false,
    type: Sequelize.DATE
  }
});