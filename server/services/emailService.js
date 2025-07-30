import nodemailer from 'nodemailer';
import config from '../config/index.js';

console.log('🔥 EmailService file loading - DEBUG POINT 1');
console.log('🔥 Nodemailer imported:', typeof nodemailer, Object.keys(nodemailer));

class EmailService {
  constructor() {
    console.log('📧 Initializing EmailService...');
    
    // Debug email configuration
    console.log('📧 Email Configuration:', {
      host: config.email.host,
      port: config.email.port,
      user: config.email.user ? 'SET' : 'NOT SET',
      password: config.email.password ? 'SET' : 'NOT SET',
      from: config.email.from
    });

    try {
      console.log('📧 Nodemailer object:', typeof nodemailer);
      console.log('📧 createTransport method:', typeof nodemailer.createTransport);
      
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
      console.log('✅ Email transporter created successfully');
    } catch (error) {
      console.log('⚠️ Email transporter creation failed:', error.message);
      console.log('⚠️ Full error:', error);
      this.transporter = null;
    }

    // Test connection on startup
    this.testConnection();
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

  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${config.clientUrl}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"Blood For Nepal 🩸" <${config.email.from}>`,
      to: user.email,
      subject: '🔐 Reset Your Blood For Nepal Password',
      html: this.getPasswordResetEmailTemplate(user, resetUrl, resetToken)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', info.messageId);
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Password reset email sending failed:', error);
      throw new Error('Failed to send password reset email. Please try again.');
    }
  }

  async sendPasswordResetConfirmation(user) {
    const mailOptions = {
      from: `"Blood For Nepal 🩸" <${config.email.from}>`,
      to: user.email,
      subject: '✅ Password Reset Successful - Blood For Nepal',
      html: this.getPasswordResetConfirmationTemplate(user)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Password reset confirmation email sent:', info.messageId);
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Password reset confirmation email sending failed:', error);
      // Don't throw error for confirmation email failure
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
          .feature-item { color: #6b7280; font-size: 14px; margin: 8px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🩸 Welcome to Blood For Nepal</h1>
            <p>Save Lives Through Blood Donation</p>
          </div>
          
          <div class="content">
            <div class="greeting">नमस्ते ${user.full_name}!</div>
            
            <div class="message">
              Thank you for joining Blood For Nepal! To complete your registration and start connecting with blood donors and recipients, please verify your email address.
            </div>
            
            <div class="button-container">
              <a href="${verificationUrl}" class="verify-button">
                ✅ Verify My Email
              </a>
            </div>
            
            <div class="features">
              <p style="margin: 0 0 15px 0; color: #374151; font-weight: 600;">What you can do after verification:</p>
              <div class="feature-item">🔍 Search for blood donors in your area</div>
              <div class="feature-item">🆘 Create emergency blood requests</div>
              <div class="feature-item">💝 Volunteer as a blood donor</div>
              <div class="feature-item">📱 Receive SMS notifications for urgent requests</div>
              <div class="feature-item">🏆 Track your donation history</div>
            </div>
            
            <div class="warning">
              <p class="warning-text">
                <strong>⚠️ Important:</strong> This verification link expires in 24 hours for security reasons. If you didn't create this account, please ignore this email.
              </p>
            </div>
            
            <p class="link-text">
              If the button above doesn't work, copy and paste this link into your browser:<br>
              ${verificationUrl}
            </p>
          </div>
          
          <div class="footer">
            <p class="footer-text">
              Blood For Nepal - Connecting lives through safe blood donation<br>
              This is an automated email. Please do not reply to this message.
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
          .header { background: linear-gradient(135deg, #10b981, #059669); padding: 40px 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 32px; font-weight: 700; }
          .header p { color: rgba(255,255,255,0.9); margin: 12px 0 0 0; font-size: 18px; }
          .content { padding: 40px 30px; }
          .greeting { color: #374151; font-size: 28px; font-weight: 600; margin-bottom: 24px; text-align: center; }
          .message { color: #6b7280; font-size: 16px; line-height: 1.7; margin-bottom: 30px; }
          .stats { background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center; }
          .stat-item { display: inline-block; margin: 10px 20px; }
          .stat-number { color: #0ea5e9; font-size: 24px; font-weight: 700; }
          .stat-label { color: #64748b; font-size: 14px; }
          .next-steps { background-color: #fef7ff; border: 2px solid #f3e8ff; border-radius: 12px; padding: 25px; margin: 30px 0; }
          .step-item { color: #6b21a8; font-size: 16px; margin: 12px 0; padding-left: 25px; position: relative; }
          .step-item:before { content: "✓"; position: absolute; left: 0; color: #10b981; font-weight: bold; }
          .button-container { text-align: center; margin: 40px 0; }
          .dashboard-button { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 18px 45px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3); transition: transform 0.2s; }
          .dashboard-button:hover { transform: translateY(-3px); }
          .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
          .footer-text { color: #9ca3af; font-size: 14px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to the Community!</h1>
            <p>You're now part of Nepal's blood donation network</p>
          </div>
          
          <div class="content">
            <div class="greeting">स्वागतम् ${user.full_name}!</div>
            
            <div class="message">
              Your email has been verified successfully! You're now a member of Blood For Nepal, 
              where every drop counts in saving precious lives across Nepal.
            </div>
            
            <div class="stats">
              <div class="stat-item">
                <div class="stat-number">1000+</div>
                <div class="stat-label">Active Donors</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">500+</div>
                <div class="stat-label">Lives Saved</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">24/7</div>
                <div class="stat-label">Emergency Support</div>
              </div>
            </div>
            
            <div class="next-steps">
              <h3 style="color: #6b21a8; margin: 0 0 20px 0;">Your next steps:</h3>
              <div class="step-item">Complete your donor profile</div>
              <div class="step-item">Set your availability preferences</div>
              <div class="step-item">Enable emergency notifications</div>
              <div class="step-item">Connect with local blood banks</div>
              <div class="step-item">Start making a difference!</div>
            </div>
            
            <div class="message">
              Ready to start your journey in saving lives? Access your dashboard to explore 
              donation opportunities, emergency requests, and connect with others in your community.
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

  getPasswordResetEmailTemplate(user, resetUrl, resetToken) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - Blood For Nepal</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; }
          .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; }
          .content { padding: 40px 30px; }
          .greeting { color: #374151; font-size: 24px; font-weight: 600; margin-bottom: 20px; }
          .message { color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
          .button-container { text-align: center; margin: 40px 0; }
          .reset-button { display: inline-block; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3); transition: transform 0.2s; }
          .reset-button:hover { transform: translateY(-2px); }
          .token-box { background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
          .token-text { font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; color: #1e293b; letter-spacing: 2px; }
          .warning { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .warning-text { color: #dc2626; font-size: 14px; margin: 0; }
          .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
          .footer-text { color: #9ca3af; font-size: 14px; margin: 0; }
          .expiry-notice { background-color: #fffbeb; border: 1px solid #fed7aa; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .expiry-text { color: #d97706; font-size: 14px; margin: 0; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
            <p>Blood For Nepal - Secure Account Recovery</p>
          </div>
          
          <div class="content">
            <div class="greeting">नमस्ते ${user.full_name}!</div>
            
            <div class="message">
              We received a request to reset your Blood For Nepal account password. 
              If you made this request, click the button below to set a new password:
            </div>
            
            <div class="button-container">
              <a href="${resetUrl}" class="reset-button">
                🔒 Reset My Password
              </a>
            </div>
            
            <div class="token-box">
              <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px;">If the button doesn't work, use this reset code:</p>
              <div class="token-text">${resetToken}</div>
            </div>
            
            <div class="expiry-notice">
              <p class="expiry-text">
                ⏰ This reset link expires in 30 minutes for security reasons.
              </p>
            </div>
            
            <div class="warning">
              <p class="warning-text">
                <strong>⚠️ Security Notice:</strong><br>
                • If you didn't request this password reset, please ignore this email<br>
                • Never share your reset code with anyone<br>
                • Contact our support team if you have concerns
              </p>
            </div>
            
            <div class="message">
              For your security, this request was made and will expire automatically.
              If you continue to have trouble accessing your account, please contact our support team.
            </div>
          </div>
          
          <div class="footer">
            <p class="footer-text">
              Blood For Nepal - Connecting lives through safe blood donation<br>
              This is an automated security email. Please do not reply.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordResetConfirmationTemplate(user) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Successful - Blood For Nepal</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; }
          .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; }
          .content { padding: 40px 30px; }
          .greeting { color: #374151; font-size: 24px; font-weight: 600; margin-bottom: 20px; }
          .message { color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
          .button-container { text-align: center; margin: 40px 0; }
          .login-button { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); transition: transform 0.2s; }
          .login-button:hover { transform: translateY(-2px); }
          .success-notice { background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .success-text { color: #166534; font-size: 14px; margin: 0; font-weight: 600; }
          .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
          .footer-text { color: #9ca3af; font-size: 14px; margin: 0; }
          .security-tips { background-color: #fef9e7; border: 1px solid #fde047; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .tips-text { color: #a16207; font-size: 14px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Password Reset Successful</h1>
            <p>Blood For Nepal - Account Security Confirmation</p>
          </div>
          
          <div class="content">
            <div class="greeting">नमस्ते ${user.full_name}!</div>
            
            <div class="success-notice">
              <p class="success-text">
                🎉 Your Blood For Nepal account password has been successfully reset!
              </p>
            </div>
            
            <div class="message">
              Your account is now secure with your new password. You can now log in using your new credentials.
            </div>
            
            <div class="button-container">
              <a href="${config.clientUrl}/login" class="login-button">
                🔐 Login to Your Account
              </a>
            </div>
            
            <div class="security-tips">
              <p class="tips-text">
                <strong>🛡️ Security Tips:</strong><br>
                • Use a strong, unique password for your account<br>
                • Don't share your login credentials with anyone<br>
                • Log out from shared devices<br>
                • Contact us immediately if you notice suspicious activity
              </p>
            </div>
            
            <div class="message">
              If you didn't reset your password, please contact our support team immediately. 
              Your account security is our top priority.
            </div>
          </div>
          
          <div class="footer">
            <p class="footer-text">
              Blood For Nepal - Connecting lives through safe blood donation<br>
              This is an automated security confirmation. Please do not reply.
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

export const emailService = new EmailService();
export default emailService;
