import nodemailer from 'nodemailer';

export async function sendVerificationEmail(email: string, otp: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
      <div style="background: #1e293b; color: #fff; padding: 24px 32px;">
        <h2 style="margin: 0;">Welcome to DevCollab!</h2>
      </div>
      <div style="padding: 32px;">
        <p style="font-size: 16px; color: #334155;">Hi there,</p>
        <p style="font-size: 16px; color: #334155;">
          Thank you for signing up. Please use the following One-Time Password (OTP) to verify your email address:
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="background: #2563eb; color: #fff; padding: 14px 32px; border-radius: 6px; font-size: 24px; font-weight: bold; letter-spacing: 4px; display: inline-block;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 14px; color: #64748b;">
          This OTP will expire in 10 minutes.<br>
          If you did not create an account, you can safely ignore this email.
        </p>
      </div>
      <div style="background: #f1f5f9; color: #64748b; text-align: center; padding: 16px; font-size: 13px;">
        &copy; ${new Date().getFullYear()} DevCollab. All rights reserved.
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Your DevCollab OTP Code',
    html,
  });
}


export async function sendPasswordResetEmail(email: string, otp: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
      <div style="background: #1e293b; color: #fff; padding: 24px 32px;">
        <h2 style="margin: 0;">Reset Your Password</h2>
      </div>
      <div style="padding: 32px;">
        <p style="font-size: 16px; color: #334155;">Hi,</p>
        <p style="font-size: 16px; color: #334155;">
          Use the following One-Time Password (OTP) to reset your password. This OTP will expire in 10 minutes.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="background: #2563eb; color: #fff; padding: 14px 32px; border-radius: 6px; font-size: 24px; font-weight: bold; letter-spacing: 4px; display: inline-block;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 14px; color: #64748b;">
          If you did not request this, you can safely ignore this email.
        </p>
      </div>
      <div style="background: #f1f5f9; color: #64748b; text-align: center; padding: 16px; font-size: 13px;">
        &copy; ${new Date().getFullYear()} DevCollab. All rights reserved.
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Your Password Reset OTP - DevCollab',
    html,
  });
}