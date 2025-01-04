const amqplib = require("amqplib");


//Message Broker
module.exports.CreateChannel = async () => {
  try {
    const connection = await amqplib.connect(process.env.MESSAGE_BROKER_URL);
    const channel = await connection.createChannel();
    await channel.assertExchange(process.env.EXCHANGE_NAME,"direct",{durable:true});
    return channel;
  } catch (err) {
    throw err;
  }
};

// module.exports.PublishMessage = (channel, msg) => {
//  try{ channel.publish(process.env.EXCHANGE_NAME, process.env.NOTIFICATION_BINDING_KEY, Buffer.from(msg));
//   console.log("Sent: ", msg);}catch(err){
//     throw err
//   }
// };

// Consumes messages from a queue processes and acknowledges them.
module.exports.SubscribeMessage = async (channel, service) => {
  const appQueue=await channel.assertQueue(process.env.QUEUE_NAME,{durable:true})
  channel.bindQueue(appQueue.queue,process.env.EXCHANGE_NAME,process.env.NOTIFICATION_BINDING_KEY)
  channel.consume(appQueue.queue,data=>{
    console.log('dataaa from notification service',data.content.toString())
    service.SubscribeEvents(data.content.toString())
    channel.ack(data)
  })
 };