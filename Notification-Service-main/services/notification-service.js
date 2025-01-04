const nodemailer = require('nodemailer');
const Notification = require('../database/models/Notification');
const { FormatData } = require('../utils');
require('dotenv').config();

class NotificationService {
    constructor() {
        console.log('Initializing email transporter with:', process.env.EMAIL_ADDRESS);
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.APP_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Verify transporter
        this.transporter.verify((error, success) => {
            if (error) {
                console.error('Error verifying transporter:', error);
            } else {
                console.log('Email transporter is ready to send emails');
            }
        });
    }

    async SendOrderConfirmation(userId, orderData) {
        try {
            console.log('Preparing to send order confirmation email for order:', orderData.orderId);
            
            // The email content
            const emailContent = `
                <h1>Order Confirmation</h1>
                <p>Thank you for your order!</p>
                <h2>Order Details:</h2>
                <p>Order ID: ${orderData.orderId}</p>
                <p>Total Amount: $${orderData.total}</p>
                <h3>Items:</h3>
                <ul>
                    ${orderData.items.map(item => `
                        <li>
                            ${item.name} - Quantity: ${item.quantity} - Price: $${item.price}
                        </li>
                    `).join('')}
                </ul>
            `;

            console.log('Sending email to:', process.env.EMAIL_ADDRESS);

            // Send email
            const mailOptions = {
                from: {
                    name: 'MultiVendor Marketplace',
                    address: process.env.EMAIL_ADDRESS
                },
                to: process.env.EMAIL_ADDRESS,
                subject: 'Order Confirmation - MultiVendor Marketplace',
                html: emailContent
            };

            console.log('Attempting to send email...');
            const result = await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully. Message ID:', result.messageId);

            // Save notification to database
            const notification = await Notification.create({
                recipient: process.env.EMAIL_ADDRESS,
                content: emailContent,
                type: 'order_confirmation',
                status: 'sent'
            });

            console.log('Notification saved to database with ID:', notification.id);
            return { emailResult: result, notification };
        } catch (error) {
            console.error('Error in SendOrderConfirmation:', error);
            throw error;
        }
    }

    async SubscribeEvents(payload) {
        try {
            console.log('Received raw payload:', payload);
            const { event, data } = JSON.parse(payload);
            console.log('Parsed event type:', event);
            console.log('Parsed event data:', JSON.stringify(data, null, 2));

            switch(event) {
                case 'ORDER_CREATED':
                    console.log('Processing ORDER_CREATED event');
                    await this.SendOrderConfirmation(data.userId, data.order);
                    break;
                default:
                    console.log('Unhandled event type:', event);
            }
        } catch (error) {
            console.error('Error in SubscribeEvents:', error);
            throw error;
        }
    }
}

module.exports = NotificationService;
