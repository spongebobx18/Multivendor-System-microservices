const NotificationService = require("../services/notification-service");
const { PublishCustomerEvent, SubscribeMessage } = require("../utils");
const  auth = require('./middleware/auth');
const { PublishMessage } = require('../utils')

notificationRoutes = (app, channel) => {
    
    const service = new NotificationService();

    SubscribeMessage(channel, service)
 
}
module.exports=notificationRoutes