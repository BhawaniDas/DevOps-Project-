// backend/utils/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mr.bhawani04@gmail.com', 
    pass: 'jirw qvhg wbzz nmcu'      // Yahan 16-digit App Password
  }
});

exports.sendAdminApprovalEmail = async (user) => {
  try {
    await transporter.sendMail({
      from: '"TaskDash System" <noreply@taskdash.com>',
      to: 'mr.bhawani04@gmail.com',
      subject: '🚨 New Admin Access Request',
      html: `
        <h3>New Admin Request!</h3>
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p>User ne Admin role ke liye apply kiya hai. Please check your DB.</p>
      `
    });
    console.log("✅ Admin notification email sent successfully.");
  } catch (error) {
    console.error("❌ Email error:", error);
  }
};