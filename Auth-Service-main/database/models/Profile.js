const { DataTypes } = require('sequelize');
const sequelize = require('../connection');

const Profile = sequelize.define('profile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('Male', 'Female'),
    allowNull: false
  },
  street: {
    type: DataTypes.STRING,
    allowNull: false
  },
  postalCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  cart: {
    type: DataTypes.JSON,
    defaultValue: [],
    allowNull: false
  },
  wishlist: {
    type: DataTypes.JSON,
    defaultValue: [],
    allowNull: false
  },
  orders: {
    type: DataTypes.JSON,
    defaultValue: [],
    allowNull: false
  }
}, {
  timestamps: true,
  underscored: true,
  tableName: 'profiles'
});

module.exports = Profile;