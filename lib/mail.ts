import nodemailer from "nodemailer"

export const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD, // Use App Password, not regular password
    },
  })
}

export const sendEmail = async (to: string, subject: string, html: string) => {
  const transporter = createTransporter()

  const mailOptions = {
    from: process.env.EMAIL_SERVER_USER,
    to,
    subject,
    html,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log("Email sent successfully")
    return true
  } catch (error: any) {
    console.error("Error sending email:", error)
    return false
  }
}
