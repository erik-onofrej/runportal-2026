import nodemailer from "nodemailer"
import Mail from "nodemailer/lib/mailer"

export async function sendEmail(
  to: string,
  subject: string,
  message: string
) {
  const mailOptions: Mail.Options = {
    from: process.env.FROM_EMAIL!,
    to,
    subject,
    text: message,
  }

  const sendMailPromise = () =>
    new Promise<string>((resolve, reject) => {
      getTransport().sendMail(mailOptions, function (err) {
        if (!err) {
          resolve("Email sent")
        } else {
          reject(err.message)
        }
      })
    })

  try {
    await sendMailPromise()
    return "success"
  } catch (error) {
    console.error("Error sending email:", error)
    return "error"
  }
}

export function getTransport() {
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_SERVER_HOST,
    port: parseInt(process.env.SMTP_SERVER_PORT || "587"),
    secure: process.env.SMTP_SERVER_SECURE === "true",
    auth: {
      user: process.env.SMTP_SERVER_USERNAME,
      pass: process.env.SMTP_SERVER_PASSWORD,
    },
  })
  return transport
}
