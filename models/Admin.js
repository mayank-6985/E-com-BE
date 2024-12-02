
const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const Admin = sequelize.define("Admin", {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
});

module.exports = Admin;
    