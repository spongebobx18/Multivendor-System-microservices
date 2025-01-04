const User = require('./User');
const Profile = require('./Profile');

// Define associations
User.hasOne(Profile, {
  foreignKey: 'user_id',
  as: 'profile',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Profile.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

module.exports = {
  User,
  Profile
};
