require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const amqplib = require("amqplib");

// Utility Functions

module.exports.GeneratePassword = async (password) => {
  return await bcrypt.hash(password, 8);
};

module.exports.ValidatePassword = async (enteredPassword, savedPassword) => {
  return await bcrypt.compare(enteredPassword, savedPassword);
};

module.exports.GenerateSignature = async (payload) => {
  const secretKey = "secretKey"; // Hardcoded secret key
  try {
    return jwt.sign(payload, secretKey, { expiresIn: "30d" });
  } catch (error) {
    console.error("JWT Generation Error:", error);
    return null;
  }
};

module.exports.ValidateSignature = async (req) => {
  const secretKey = "secretKey"; // Hardcoded secret key
  try {
    const signature = req.get("Authorization");
    if (!signature) throw new Error("Authorization header missing");
    const payload = jwt.verify(signature.split(" ")[1], secretKey);
    req.user = payload;
    return true;
  } catch (error) {
    console.error("JWT Validation Error:", error);
    return false;
  }
};

module.exports.FormatData = (data) => {
  if (data) {
    return { data };
  } else {
    throw new Error("Data Not Found!");
  }
};

// RabbitMQ Functions

module.exports.CreateChannel = async () => {
  try {
    const connection = await amqplib.connect(process.env.MESSAGE_BROKER_URL);
    const channel = await connection.createChannel();
    await channel.assertExchange(process.env.EXCHANGE_NAME, "direct", {
      durable: true,
    });
    return channel;
  } catch (err) {
    console.error("RabbitMQ Connection Error:", err);
    throw err;
  }
};

module.exports.PublishMessage = (channel, bindingKey, msg) => {
  if (!channel) {
    console.error("RabbitMQ channel not available");
    throw new Error("RabbitMQ channel is not open");
  }
  try {
    channel.publish(process.env.EXCHANGE_NAME, bindingKey, Buffer.from(msg));
    console.log("Message Published:", msg);
  } catch (err) {
    console.error("Message Publishing Error:", err);
    throw err;
  }
};

module.exports.SubscribeMessage = async (channel, service) => {
  try {
    const appQueue = await channel.assertQueue(process.env.QUEUE_NAME, {
      durable: true,
    });
    await channel.bindQueue(
      appQueue.queue,
      process.env.EXCHANGE_NAME,
      process.env.NOTIFICATION_BINDING_KEY
    );

    channel.consume(appQueue.queue, (data) => {
      if (data) {
        console.log("Received Message:", data.content.toString());
        service.SubscribeEvents(data.content.toString());
        channel.ack(data);
      }
    });
  } catch (err) {
    console.error("Subscription Error:", err);
    throw err;
  }
};
