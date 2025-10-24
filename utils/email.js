const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (email, name, token) => {
  try {
    const verificationUrl = `http://mobileonlysjmp.onrender.com/api/verify-email?token=${token}`;
    
    const mailOptions = {
      from: {
        name: 'SJMP Parish App',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: "Verify Your Email Address - SJMP Parish App",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1F7A8C;">Email Verification Required</h2>
          <p>Hello ${name},</p>
          <p>Thank you for registering with SJMP Parish App!</p>
          <p>Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #1F7A8C; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 8px; display: inline-block;
                      font-size: 16px; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          <p><strong>This link will expire in 24 hours.</strong></p>
          <p>If you didn't create an account, please ignore this email.</p>
          <br>
          <p>Best regards,<br>SJMP Parish App Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Email sending error:', error);
    throw error;
  }
};

const sendPasswordResetEmail = async (email, name, code) => {
  try {
    const mailOptions = {
      from: {
        name: 'SJMP Parish App',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: "SJMP Parish App - Password Reset Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1F7A8C;">Password Reset Verification</h2>
          <p>Hello ${name || 'User'},</p>
          <p>You requested a password reset for your SJMP Parish App account.</p>
          <p>Use the verification code below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1F7A8C;">
              ${code}
            </div>
          </div>
          <p><strong>This code will expire in 15 minutes.</strong></p>
          <p>If you didn't request this reset, please ignore this email.</p>
          <br>
          <p>Best regards,<br>SJMP Parish App Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Password reset email error:', error);
    throw error;
  }
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };