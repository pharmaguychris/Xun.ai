const express = require('express');
const router = express.Router();
const { Contact, validateContact } = require('../models/Contact');
const { sendEmail } = require('../utils/email');
const rateLimit = require('express-rate-limit');

// Rate limiting for contact form
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 requests per hour
    message: 'Too many contact requests. Please try again in an hour.'
});

// Submit contact form
router.post('/', contactLimiter, async (req, res) => {
    try {
        // Validate input
        const { error } = validateContact(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        // Create contact entry
        const contact = new Contact({
            ...req.body,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });

        // Save to database
        await contact.save();

        // Send notification email
        await sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: 'New Contact Form Submission',
            text: `
                Name: ${contact.name}
                Email: ${contact.email}
                Message: ${contact.message}
            `
        });

        // Send auto-response to user
        await sendEmail({
            to: contact.email,
            subject: 'Thank you for contacting Xun.ai',
            text: `
                Dear ${contact.name},

                Thank you for reaching out! I've received your message and will get back to you within 24-48 hours.

                Best regards,
                Xun
            `
        });

        res.status(201).json({ message: 'Contact form submitted successfully' });
    } catch (err) {
        console.error('Contact form error:', err);
        res.status(500).json({ error: 'Error submitting contact form' });
    }
});

module.exports = router;
