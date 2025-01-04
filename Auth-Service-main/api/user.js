const UserService = require("../services/user-service");
const auth = require("./middleware/auth");
const { SubscribeMessage } = require("../utils");

userRoutes = (app, channel) => {
  const service = new UserService();

  SubscribeMessage(channel, service);

  app.post("/signup", async (req, res, next) => {
    try {
      const { email, password, phone, role } = req.body;
      const { data } = await service.SignUp({ email, password, phone, role });      
      return res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  });

  app.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const userService = new UserService();
      const userData = await userService.SignIn({ email, password });
      
      if (!userData) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      return res.json(userData);
    } catch (error) {
      console.error("Login error:", error);
      return res.status(401).json({ message: error.message || "Invalid credentials" });
    }
  });

  app.post("/profile", auth, async (req, res, next) => {
    try {
      const { _id } = req.user;
      const { name, gender, street, postalCode, city, country } = req.body;
      
      const profileData = {
        name,
        gender,
        street,
        postalCode,
        city,
        country
      };
      
      const { data } = await service.AddProfile(_id, profileData);
      return res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  });

  app.put("/profile", auth, async (req, res, next) => {
    try {
      const { _id } = req.user;
      const { name,gender,street, postalCode, city, country } = req.body;
      const { data } = await service.EditProfile(_id, {
        name,
        gender,
        street,
        postalCode,
        city,
        country,
      });
      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/profile", auth, async (req, res) => {
    try {
      const { _id } = req.user;
      const userService = new UserService();
      const userData = await userService.GetProfile(_id);
      
      if (!userData) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.json(userData);
    } catch (error) {
      console.error("Profile error:", error);
      return res.status(500).json({ message: error.message || "Error fetching profile" });
    }
  });

  app.get("/cart", auth, async (req, res, next) => {
    try {
      const { _id } = req.user;
      const { data } = await service.GetCart(_id);
      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/wishlist", auth, async (req, res, next) => {
    try {
      const { _id } = req.user;
      const { data } = await service.GetWishList(_id);
      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/", auth, async (req, res, next) => {
    try {
      const {user}=await service.GetUser(req.user._id)
      return res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  });
};

module.exports = userRoutes;
