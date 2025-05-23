import nodemailer from "nodemailer"

// Create a transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: process.env.EMAIL_SERVER_SECURE === "true",
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

// Email sending interface
interface SendEmailParams {
  to: string
  subject: string
  text: string
  html: string
}

// Export the sendEmail function
export async function sendEmail({ to, subject, text, html }: SendEmailParams) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    })

    console.log("Email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}

// Send verification email function
export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`

  const subject = "Verify your email address"
  const text = `Please verify your email address by clicking on the following link: ${verificationUrl}`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #333; text-align: center;">Email Verification</h2>
      <p style="color: #555; font-size: 16px;">Thank you for registering with Knowledge Hub Nepal. Please verify your email address to complete your registration.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email Address</a>
      </div>
      <p style="color: #555; font-size: 14px;">If you did not create an account, you can safely ignore this email.</p>
      <p style="color: #555; font-size: 14px;">If the button above doesn't work, copy and paste the following link into your browser:</p>
      <p style="color: #555; font-size: 14px; word-break: break-all;">${verificationUrl}</p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #888; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Knowledge Hub Nepal. All rights reserved.</p>
      </div>
    </div>
  `

  return sendEmail({ to: email, subject, text, html })
}

// Add the missing password reset email function
export async function sendPasswordResetEmail(email: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const resetUrl = `${baseUrl}/reset-password?token=${token}`

  const subject = "Reset your password"
  const text = `Please reset your password by clicking on the following link: ${resetUrl}. This link will expire in 1 hour.`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #333; text-align: center;">Password Reset</h2>
      <p style="color: #555; font-size: 16px;">You requested a password reset for your Knowledge Hub Nepal account. Click the button below to set a new password.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
      </div>
      <p style="color: #555; font-size: 14px;">If you did not request a password reset, you can safely ignore this email.</p>
      <p style="color: #555; font-size: 14px;">This password reset link will expire in 1 hour.</p>
      <p style="color: #555; font-size: 14px;">If the button above doesn't work, copy and paste the following link into your browser:</p>
      <p style="color: #555; font-size: 14px; word-break: break-all;">${resetUrl}</p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #888; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Knowledge Hub Nepal. All rights reserved.</p>
      </div>
    </div>
  `

  return sendEmail({ to: email, subject, text, html })
}

// Default export for backward compatibility
export default {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
}
