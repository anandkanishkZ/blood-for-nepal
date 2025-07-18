import nodemailer from 'nodemailer';
import config from '../config/index.js';

class EmailService {
  constructor() {
    // Debug email configuration
    console.log('📧 Email Configuration:', {
      host: config.email.host,
      port: config.email.port,
      portType: typeof config.email.port,
      user: config.email.user,
      from: config.email.from,
      secure: config.email.port === 465
    });

    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465, // true for 465 (SSL), false for other ports
      auth: {
        user: config.email.user,
        pass: config.email.password
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendVerificationEmail(user, verificationToken) {
    const verificationUrl = `${config.clientUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;
    
    const mailOptions = {
      from: `"Blood For Nepal 🩸" <${config.email.from}>`,
      to: user.email,
      subject: '🩸 Verify Your Blood For Nepal Account',
      html: this.getVerificationEmailTemplate(user, verificationUrl)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Verification email sent:', info.messageId);
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send verification email. Please try again.');
    }
  }

  async sendWelcomeEmail(user) {
    const mailOptions = {
      from: `"Blood For Nepal 🩸" <${config.email.from}>`,
      to: user.email,
      subject: '🎉 Welcome to Blood For Nepal!',
      html: this.getWelcomeEmailTemplate(user)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent:', info.messageId);
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Welcome email sending failed:', error);
      // Don't throw error for welcome email failure
      return { success: false };
    }
  }

  getVerificationEmailTemplate(user, verificationUrl) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Blood For Nepal</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; }
          .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; }
          .content { padding: 40px 30px; }
          .greeting { color: #374151; font-size: 24px; font-weight: 600; margin-bottom: 20px; }
          .message { color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
          .button-container { text-align: center; margin: 40px 0; }
          .verify-button { display: inline-block; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3); transition: transform 0.2s; }
          .verify-button:hover { transform: translateY(-2px); }
          .link-text { color: #6b7280; font-size: 14px; margin-top: 20px; word-break: break-all; }
          .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
          .footer-text { color: #9ca3af; font-size: 14px; margin: 0; }
          .warning { background-color: #fef3cd; border: 1px solid #fde68a; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .warning-text { color: #92400e; font-size: 14px; margin: 0; }
          .features { background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .features h3 { color: #ef4444; margin: 0 0 15px 0; font-size: 18px; }
          .features ul { list-style: none; padding: 0; margin: 0; }
          .features li { color: #6b7280; margin: 8px 0; padding-left: 20px; position: relative; }
          .features li:before { content: "✓"; color: #10b981; font-weight: bold; position: absolute; left: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Blood For Nepal</h1>
            <p>Connecting Donors, Saving Lives</p>
          </div>
          
          <div class="content">
            <div class="greeting">Welcome ${user.full_name}! 🩸</div>
            
            <div class="message">
              Thank you for joining Blood For Nepal, Nepal's leading blood donation platform. 
              To complete your registration and start saving lives, please verify your email address.
            </div>

            <div class="features">
              <h3>What you can do after verification:</h3>
              <ul>
                <li>Find blood donors and recipients in your area</li>
                <li>Register for blood donation camps</li>
                <li>Track your donation history</li>
                <li>Get emergency blood requests</li>
                <li>Connect with the blood donation community</li>
              </ul>
            </div>
            
            <div class="button-container">
              <a href="${verificationUrl}" class="verify-button">
                Verify Email Address
              </a>
            </div>
            
            <div class="warning">
              <p class="warning-text">
                <strong>Security Notice:</strong> This verification link will expire in 24 hours. 
                If you didn't create this account, please ignore this email.
              </p>
            </div>
            
            <div class="link-text">
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="color: #3b82f6;">${verificationUrl}</p>
            </div>
          </div>
          
          <div class="footer">
            <p class="footer-text">
              Blood For Nepal - Empowering Communities Through Blood Donation<br>
              Making a difference, one donation at a time.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getWelcomeEmailTemplate(user) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Blood For Nepal</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 30px; }
          .greeting { color: #374151; font-size: 24px; font-weight: 600; margin-bottom: 20px; }
          .message { color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
          .button-container { text-align: center; margin: 40px 0; }
          .dashboard-button { display: inline-block; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; }
          .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
          .footer-text { color: #9ca3af; font-size: 14px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 You're In!</h1>
          </div>
          
          <div class="content">
            <div class="greeting">Hello ${user.full_name}!</div>
            
            <div class="message">
              Your email has been verified successfully! Welcome to the Blood For Nepal community. 
              You can now access all features and start making a difference in people's lives.
            </div>
            
            <div class="button-container">
              <a href="${config.clientUrl}/dashboard" class="dashboard-button">
                Go to Dashboard
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p class="footer-text">
              Thank you for joining our mission to save lives through blood donation.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Test email service connection
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connected successfully');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error.message);
      return false;
    }
  }
}

export default new EmailService();
