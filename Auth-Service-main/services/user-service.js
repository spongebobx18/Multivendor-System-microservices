const UserRepository = require("../database/repository/user-repository");
const {
  FormatData,
  GeneratePassword,
  GenerateSignature,
  ValidatePassword,
} = require("../utils");

class UserService {
  constructor() {
    this.repository = new UserRepository();
  }

  async SignIn(userInputs) {
    const { email, password } = userInputs;
    
    try {
      const user = await this.repository.FindUser({ email });

      if (!user) {
        throw new Error('User not found');
      }

      const validPassword = await ValidatePassword(password, user.password);
      
      if (!validPassword) {
        throw new Error('Invalid password');
      }

      const token = await GenerateSignature({
        email: user.email,
        _id: user.id,
        role: user.role,
      });

      return { 
        id: user.id, 
        email: user.email,
        role: user.role,
        token 
      };
    } catch (error) {
      throw error;
    }
  }

  async SignUp(userInputs) {
    const { email, password, phone, role } = userInputs;
    let userPassword = await GeneratePassword(password);

    const user = await this.repository.CreateUser({
      email,
      password: userPassword,
      phone,
      role,
    });

    const token = await GenerateSignature({
      email: email,
      _id: user.id,
      role: role,
    });
    return FormatData({ id: user.id, token, role });
  }

  async AddProfile(_id, profileData) {
    const { name, gender, street, postalCode, city, country } = profileData;
    const profile = await this.repository.CreateProfile({
      _id,
      name,
      gender,
      street,
      postalCode,
      city,
      country,
    });
    return FormatData(profile);
  }

  async GetProfile(id) {
    try {
      const user = await this.repository.FindUserById(id);
      
      if (!user) {
        throw new Error("User not found");
      }

      // Generate a new token to ensure session persistence
      const token = await GenerateSignature({
        email: user.email,
        _id: user.id,
        role: user.role,
      });

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        phone: user.phone,
        token
      };
    } catch (error) {
      throw error;
    }
  }

  async EditProfile(_id, profileData) {
    const { name, gender, street, postalCode, city, country } = profileData;
    const updatedProfile = await this.repository.EditProfile({
      _id,
      name,
      gender,
      street,
      postalCode,
      city,
      country,
    });
    return FormatData(updatedProfile);
  }

  async GetUser(id) {
    const user = await this.repository.FindUserById({ id });
    return FormatData(user);
  }

  async GetCart(id) {
    const user = await this.repository.FindUserById({ id });
    return FormatData(user.profile.cart || []);
  }

  async GetWishList(id) {
    const user = await this.repository.FindUserById({ id });
    return FormatData(user.profile.wishlist || []);
  }

  async AddToWishlist(userId, product) {
    try {
      const wishlistItem = await this.repository.AddWishlistItem(userId, product);
      return FormatData(wishlistItem);
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      throw err;
    }
  }

  async ManageCart(userId, product, amount, isRemove) {
    try {
      const cartResult = await this.repository.AddCartItem(
        userId,
        product,
        amount || 1,
        isRemove
      );
      return FormatData(cartResult);
    } catch (err) {
      console.error('Error managing cart:', err);
      throw err;
    }
  }

  async ManageOrder(userId, order) {
    try {
      const orderResult = await this.repository.AddOrderToProfile(userId, order);
      return FormatData(orderResult);
    } catch (err) {
      console.error('Error managing order:', err);
      throw err;
    }
  }

  async SubscribeEvents(payload) {
    try {
      const data = JSON.parse(payload);
      const { event, data: eventData } = data;
      
      const { userId, product, order } = eventData;
      const amount = eventData.amount || eventData.qty || 1;

      switch (event) {
        case "ADD_TO_WISHLIST":
        case "REMOVE_FROM_WISHLIST":
          await this.AddToWishlist(userId, product);
          break;
        case "ADD_TO_CART":
          await this.ManageCart(userId, product, amount, false);
          break;
        case "REMOVE_FROM_CART":
          await this.ManageCart(userId, product, amount, true);
          break;
        case "CREATE_ORDER":
          await this.ManageOrder(userId, order);
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Error in SubscribeEvents:', err);
    }
  }
}

module.exports = UserService;
