const express = require('express');
const cors = require('cors');
const { CreateChannel, SubscribeMessage } = require('./utils');
const NotificationService = require('./services/notification-service');
const sequelize = require('./database/connection');
require('dotenv').config();

const StartServer = async () => {
    const app = express();
    
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    try {
        // Test database connection
        await sequelize.authenticate();
        console.log('Database Connection Established Successfully');

        // Sync models with database
        await sequelize.sync({ force: false });
        console.log('Database Models Synchronized');

        // Create message broker channel
        const channel = await CreateChannel();
        console.log('Message Broker Channel Created');

        // Initialize notification service and subscribe to events
        const service = new NotificationService();
        await SubscribeMessage(channel, service);
        console.log('Subscribed to Message Broker Events');

        app.listen(8004, () => {
            console.log('Notification Service listening on port 8004');
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};

StartServer();
