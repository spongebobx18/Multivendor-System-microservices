const { DataTypes } = require('sequelize');
const sequelize = require('../connection');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  recipient: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: 'order_confirmation'
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'sent'
  }
}, {
  timestamps: true,
  tableName: 'notifications'
});

module.exports = Notification;
