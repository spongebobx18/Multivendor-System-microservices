const Profile = require("../models/Profile");
const User = require("../models/User");

class UserRepository {
  async CreateUser({ email, password, phone, role }) {
    const user = await User.create({
      email,
      password,
      phone,
      role
    });
    return user;
  }

  async CreateProfile({ _id, ...profileData }) {
    try {
      const user = await User.findByPk(_id);
      if (!user) {
        throw new Error('User not found');
      }

      const profile = await Profile.create({
        ...profileData,
        user_id: _id,
        cart: [],
        wishlist: [],
        orders: []
      });

      return await User.findByPk(_id, {
        include: [{ model: Profile, as: 'profile' }]
      });
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  }

  async EditProfile({ _id, ...profileData }) {
    try {
      const user = await User.findByPk(_id, {
        include: [{ model: Profile, as: 'profile' }]
      });

      if (!user || !user.profile) {
        throw new Error('User or profile not found');
      }

      await Profile.update(profileData, {
        where: { id: user.profile.id }
      });

      return await User.findByPk(_id, {
        include: [{ model: Profile, as: 'profile' }]
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async FindUser({ email }) {
    try {
      return await User.findOne({
        where: { email },
        include: [{ model: Profile, as: 'profile' }]
      });
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  }

  async FindUserById(id) {
    try {
      // Handle both id and _id
      const userId = typeof id === 'object' ? id._id || id.id : id;
      
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  async AddWishlistItem(userId, product) {
    try {
      const user = await User.findByPk(userId, {
        include: [{ model: Profile, as: 'profile' }]
      });

      if (!user || !user.profile) {
        throw new Error('User or profile not found');
      }

      const profile = user.profile;
      const wishlist = profile.wishlist || [];
      
      // Check if product already exists in wishlist
      const exists = wishlist.some(item => item.id === product.id);
      if (!exists) {
        wishlist.push(product);
        await Profile.update(
          { wishlist },
          { where: { id: profile.id } }
        );
      }

      return wishlist;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  }

  async AddCartItem(userId, product, qty, isRemove = false) {
    try {
      const user = await User.findByPk(userId, {
        include: [{ model: Profile, as: 'profile' }]
      });

      if (!user || !user.profile) {
        throw new Error('User or profile not found');
      }

      const profile = user.profile;
      let cart = profile.cart || [];

      if (isRemove) {
        cart = cart.filter(item => item.id !== product.id);
      } else {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
          existingItem.quantity = qty;
        } else {
          cart.push({ ...product, quantity: qty });
        }
      }

      await Profile.update(
        { cart },
        { where: { id: profile.id } }
      );

      return cart;
    } catch (error) {
      console.error('Error managing cart:', error);
      throw error;
    }
  }

  async AddOrderToProfile(userId, order) {
    try {
      const user = await User.findByPk(userId, {
        include: [{ model: Profile, as: 'profile' }]
      });

      if (!user || !user.profile) {
        throw new Error('User or profile not found');
      }

      const profile = user.profile;
      const orders = profile.orders || [];
      orders.push(order);

      await Profile.update(
        { orders },
        { where: { id: profile.id } }
      );

      // Clear cart after successful order
      await Profile.update(
        { cart: [] },
        { where: { id: profile.id } }
      );

      return orders;
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  }
}

module.exports = UserRepository;
