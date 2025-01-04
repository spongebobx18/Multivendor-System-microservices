const express = require("express");
const cors = require("cors");
const { CreateChannel, SubscribeMessage } = require("./utils");
const userRoutes = require("./api/user");
const sequelize = require('./database/connection');
const { User, Profile } = require('./database/models');
const dotenv = require("dotenv");
const print = console.log;

dotenv.config(); // Load environment variables from .env file

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname + "/public"));

async function startApp() {
  try {
    // Test the connection
    await sequelize.authenticate();
    print("Database Connection Established Successfully");

    // Force sync to drop and recreate tables
    await sequelize.sync({ force: false });
    print("Database Models Synchronized");

    const channel = await CreateChannel();

    await userRoutes(app, channel);

    app.listen(8001, () => {
      console.log("Customer is Listening to Port 8001");
    });
  } catch (err) {
    console.log("Failed to start app:", err);
  }
}

startApp();
