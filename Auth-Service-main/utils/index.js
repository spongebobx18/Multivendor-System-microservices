const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const amqplib = require("amqplib");

require('dotenv').config()
const APP_SECRET = 'secretKey';

module.exports.GeneratePassword = async (password) => {
  return await bcrypt.hash(password, 8);
};

module.exports.ValidatePassword = async (enteredPassword, savedPassword) => {
  return await bcrypt.compare(enteredPassword, savedPassword);
};

module.exports.GenerateSignature = async (payload) => {
  try {
    return jwt.sign(payload, APP_SECRET, { expiresIn: "30d" });
  } catch (error) {
    console.error("Error generating token:", error);
    throw error;
  }
};

module.exports.ValidateSignature = async (req) => {
  try {
    const signature = req.get("Authorization");
    if (!signature || !signature.startsWith('Bearer ')) {
      throw new Error('No Bearer token provided');
    }
    const payload = jwt.verify(signature.split(" ")[1], APP_SECRET);
    req.user = payload;
    return true;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
};

module.exports.FormatData = (data) => {
  if (data) {
    return { data };
  }
  return { data: null };
};

//Message Broker

module.exports.CreateChannel = async () => {
  try {
    const connection = await amqplib.connect(process.env.MESSAGE_BROKER_URL);
    const channel = await connection.createChannel();
    //do not create exchanges on the cloud. this code nor will create it once connected
    //may change this to assertQueue if issues arise
    await channel.assertExchange(process.env.EXCHANGE_NAME,"direct",{durable:true});
    return channel;
  } catch (err) {
    throw err;
  }
};


module.exports.SubscribeMessage = async (channel, service) => {
  const appQueue=await channel.assertQueue(process.env.QUEUE_NAME,{durable:true})
  channel.bindQueue(appQueue.queue,process.env.EXCHANGE_NAME,process.env.CUSTOMER_BINDING_KEY)
  channel.consume(appQueue.queue,data=>{
    service.SubscribeEvents(data.content.toString())
    console.log('dataaa',data.content.toString())
    channel.ack(data)
  })
 };