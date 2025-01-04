const { DataTypes } = require('sequelize');
const sequelize = require('../connection');

const User = sequelize.define('user', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('BUYER', 'SELLER'),
    allowNull: false
  },
  cart: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  wishlist: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  orders: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  timestamps: true,
  underscored: true,
  tableName: 'users'
});

module.exports = User;
