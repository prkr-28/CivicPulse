const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendStatusUpdateEmail = async (userEmail, issueName, newStatus) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Update on your CivicPulse report: ${issueName}`,
      html: `
        <h2>Issue Status Update</h2>
        <p>Hello,</p>
        <p>Your issue <strong>"${issueName}"</strong> has been updated to status: <strong>${newStatus}</strong></p>
        <p>Thank you for helping improve your city!</p>
        <p>Best regards,<br>CivicPulse Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✓ Email sent to ${userEmail}`);
  } catch (error) {
    console.error('✗ Failed to send email:', error.message);
  }
};

module.exports = {
  sendStatusUpdateEmail
};
