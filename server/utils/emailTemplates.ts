export const getPasswordResetTemplate = (url: string) => ({
  subject: "Reset Your Password",
  text: `You requested a password reset. Click on the link to reset your password: ${url}`,
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .email-wrapper {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      min-height: 100vh;
    }

    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
    }

    .logo-circle {
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .logo-icon {
      font-size: 40px;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    }

    .header h1 {
      color: #ffffff;
      font-size: 28px;
      font-weight: 700;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .content {
      padding: 50px 40px;
    }

    .icon-badge {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .content h2 {
      color: #1a202c;
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 16px;
      line-height: 1.3;
    }

    .content p {
      color: #4a5568;
      font-size: 16px;
      line-height: 1.8;
      margin-bottom: 32px;
    }

    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      text-decoration: none !important;
      font-weight: 600;
      font-size: 16px;
      padding: 16px 40px;
      border-radius: 12px;
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
      transition: all 0.3s ease;
      text-align: center;
    }

    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 28px rgba(102, 126, 234, 0.5);
    }

    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
      margin: 40px 0;
    }

    .security-notice {
      background: #f7fafc;
      border-left: 4px solid #667eea;
      padding: 20px;
      border-radius: 8px;
      margin-top: 32px;
    }

    .security-notice p {
      color: #2d3748;
      font-size: 14px;
      margin: 0;
      line-height: 1.6;
    }

    .security-notice strong {
      color: #1a202c;
      display: block;
      margin-bottom: 8px;
    }

    .footer {
      background: #f7fafc;
      padding: 30px 40px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }

    .footer p {
      color: #718096;
      font-size: 14px;
      margin: 8px 0;
    }

    .footer a {
      color: #667eea;
      text-decoration: none;
    }

    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 20px 10px;
      }

      .content {
        padding: 40px 24px;
      }

      .header {
        padding: 30px 20px;
      }

      .header h1 {
        font-size: 24px;
      }

      .content h2 {
        font-size: 20px;
      }

      .cta-button {
        padding: 14px 32px;
        font-size: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="header">
        <div class="logo-circle">
          <span class="logo-icon">??</span>
        </div>
        <h1>Password Reset Request</h1>
      </div>

      <div class="content">
        <div style="text-align: center;">
          <div class="icon-badge">
            <span style="font-size: 28px;">??</span>
          </div>
        </div>

        <h2>Reset Your Password</h2>

        <p>
          We received a request to reset your password. Click the button below to create a new password. This link will expire in 1 hour for security reasons.
        </p>

        <div style="text-align: center;">
          <a href="${url}" class="cta-button">Reset Password</a>
        </div>

        <div class="divider"></div>

        <div class="security-notice">
          <strong>??? Security Notice</strong>
          <p>
            If you didn't request a password reset, please ignore this email. Your password will remain unchanged. For security purposes, this link will expire in 1 hour.
          </p>
        </div>
      </div>

      <div class="footer">
        <p style="margin-bottom: 16px; color: #2d3748; font-weight: 500;">Need help?</p>
        <p>
          If you're having trouble clicking the button, copy and paste the URL below into your web browser:
        </p>
        <p style="word-break: break-all; color: #667eea; font-size: 12px; margin-top: 12px;">
          ${url}
        </p>
        <div class="divider" style="margin: 24px 0;"></div>
        <p style="font-size: 13px;">
          c ${new Date().getFullYear()} Your Company. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`,
});

export const getVerifyEmailTemplate = (url: string) => ({
  subject: "Verify Your Email Address",
  text: `Click on the link to verify your email address: ${url}`,
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .email-wrapper {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      padding: 40px 20px;
      min-height: 100vh;
    }

    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .header {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      padding: 40px 30px;
      text-align: center;
    }

    .logo-circle {
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .logo-icon {
      font-size: 40px;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    }

    .header h1 {
      color: #ffffff;
      font-size: 28px;
      font-weight: 700;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .content {
      padding: 50px 40px;
    }

    .icon-badge {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
      box-shadow: 0 4px 12px rgba(17, 153, 142, 0.3);
    }

    .content h2 {
      color: #1a202c;
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 16px;
      line-height: 1.3;
    }

    .content p {
      color: #4a5568;
      font-size: 16px;
      line-height: 1.8;
      margin-bottom: 32px;
    }

    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      color: #ffffff !important;
      text-decoration: none !important;
      font-weight: 600;
      font-size: 16px;
      padding: 16px 40px;
      border-radius: 12px;
      box-shadow: 0 8px 20px rgba(17, 153, 142, 0.4);
      transition: all 0.3s ease;
      text-align: center;
    }

    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 28px rgba(17, 153, 142, 0.5);
    }

    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
      margin: 40px 0;
    }

    .welcome-box {
      background: linear-gradient(135deg, rgba(17, 153, 142, 0.1) 0%, rgba(56, 239, 125, 0.1) 100%);
      border: 2px solid rgba(17, 153, 142, 0.2);
      padding: 24px;
      border-radius: 12px;
      margin-top: 32px;
    }

    .welcome-box h3 {
      color: #1a202c;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .welcome-box ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .welcome-box li {
      color: #2d3748;
      font-size: 14px;
      padding: 8px 0;
      padding-left: 28px;
      position: relative;
    }

    .welcome-box li:before {
      content: "�";
      position: absolute;
      left: 0;
      color: #11998e;
      font-weight: bold;
      font-size: 16px;
    }

    .footer {
      background: #f7fafc;
      padding: 30px 40px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }

    .footer p {
      color: #718096;
      font-size: 14px;
      margin: 8px 0;
    }

    .footer a {
      color: #11998e;
      text-decoration: none;
    }

    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 20px 10px;
      }

      .content {
        padding: 40px 24px;
      }

      .header {
        padding: 30px 20px;
      }

      .header h1 {
        font-size: 24px;
      }

      .content h2 {
        font-size: 20px;
      }

      .cta-button {
        padding: 14px 32px;
        font-size: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="header">
        <div class="logo-circle">
          <span class="logo-icon">?</span>
        </div>
        <h1>Welcome Aboard!</h1>
      </div>

      <div class="content">
        <div style="text-align: center;">
          <div class="icon-badge">
            <span style="font-size: 28px;">??</span>
          </div>
        </div>

        <h2>Verify Your Email Address</h2>

        <p>
          Thanks for signing up! We're excited to have you on board. To get started and unlock all features, please verify your email address by clicking the button below.
        </p>

        <div style="text-align: center;">
          <a href="${url}" class="cta-button">Verify Email Address</a>
        </div>

        <div class="divider"></div>

        <div class="welcome-box">
          <h3>?? What's Next?</h3>
          <ul>
            <li>Complete your profile setup</li>
            <li>Explore all the amazing features</li>
            <li>Connect with your team</li>
            <li>Start creating something awesome</li>
          </ul>
        </div>

        <p style="margin-top: 32px; font-size: 14px; color: #718096;">
          This verification link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
        </p>
      </div>

      <div class="footer">
        <p style="margin-bottom: 16px; color: #2d3748; font-weight: 500;">Need help?</p>
        <p>
          If you're having trouble clicking the button, copy and paste the URL below into your web browser:
        </p>
        <p style="word-break: break-all; color: #11998e; font-size: 12px; margin-top: 12px;">
          ${url}
        </p>
        <div class="divider" style="margin: 24px 0;"></div>
        <p style="font-size: 13px;">
          c ${new Date().getFullYear()} Your Company. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`,
});
