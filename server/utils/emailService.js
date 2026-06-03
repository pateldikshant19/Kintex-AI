const nodemailer = require('nodemailer');

// Initialize transporter lazily to avoid errors if credentials are missing at startup
let transporter = null;

const getTransporter = () => {
    if (transporter) return transporter;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        return transporter;
    }
    return null;
};

const sendGreetingEmail = async (user) => {
    const activeTransporter = getTransporter();
    if (!activeTransporter) {
        console.warn('Email service skipped: Missing EMAIL_USER or EMAIL_PASS in .env');
        return;
    }

    const mailOptions = {
        from: `"Kinetix AI" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Welcome to the Future of Athletic Intelligence',
        html: `
            <div style="background-color: #020617; color: #f1f5f9; padding: 40px; font-family: sans-serif; border-radius: 20px;">
                <h1 style="color: #f97316; text-transform: uppercase;">Welcome to Kinetix AI</h1>
                <p>Hi <strong>${user.name}</strong>,</p>
                <p>Your journey as a <strong>${user.role}</strong> in <strong>${user.sport}</strong> starts now.</p>
                <p>We are engineering the future of sport through data.</p>
                <a href="http://localhost:3000/login" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">Open Dashboard</a>
            </div>
        `
    };

    try {
        await activeTransporter.sendMail(mailOptions);
        console.log(`✅ Greeting email sent to ${user.email}`);
    } catch (error) {
        console.error('❌ Error sending greeting email:', error.message);
    }
};

const sendVerificationEmail = async (user) => {
    const activeTransporter = getTransporter();
    if (!activeTransporter) return;

    const verificationLink = `http://localhost:3000/verify?email=${user.email}&token=${Buffer.from(user.email).toString('base64')}`;

    const mailOptions = {
        from: `"Kinetix AI Security" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Verify Your Identity',
        html: `
            <div style="background-color: #020617; color: #f1f5f9; padding: 40px; font-family: sans-serif; border: 1px solid #3b82f6; border-radius: 20px;">
                <h2 style="color: #fff;">Identity Verification</h2>
                <p>Please verify your email address to secure your performance data.</p>
                <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">Verify Now</a>
            </div>
        `
    };

    try {
        await activeTransporter.sendMail(mailOptions);
        console.log(`✅ Verification email sent to ${user.email}`);
    } catch (error) {
        console.error('❌ Error sending verification email:', error.message);
    }
};

const sendLoginAlertEmail = async (user) => {
    const activeTransporter = getTransporter();
    if (!activeTransporter) return;

    const mailOptions = {
        from: `"Kinetix AI Security" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'New Login Detected',
        html: `
            <div style="background-color: #020617; color: #f1f5f9; padding: 40px; font-family: sans-serif; border-radius: 20px;">
                <h2 style="color: #f97316;">Security Notification</h2>
                <p>Hello ${user.name},</p>
                <p>A new login was detected on ${new Date().toLocaleString()}.</p>
                <p>If this wasn't you, please reset your password immediately.</p>
            </div>
        `
    };

    try {
        await activeTransporter.sendMail(mailOptions);
        console.log(`✅ Login alert email sent to ${user.email}`);
    } catch (error) {
        console.error('❌ Error sending login email:', error.message);
    }
};

module.exports = { sendGreetingEmail, sendVerificationEmail, sendLoginAlertEmail };
