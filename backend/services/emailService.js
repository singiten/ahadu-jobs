const nodemailer = require('nodemailer');

// Create transporter based on environment
const createTransporter = () => {
  // For development/testing - use ethereal.email
  if (process.env.NODE_ENV !== 'production') {
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.ETHEREAL_USER || 'ethereal_user',
        pass: process.env.ETHEREAL_PASS || 'ethereal_pass'
      }
    });
  }
  
  // For production - use Gmail or SendGrid
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const transporter = createTransporter();

// Email templates
const emailTemplates = {
  welcome: (name) => ({
    subject: 'Welcome to Job Portal Ethiopia!',
    html: `
      <h1>Welcome, ${name}! 🎉</h1>
      <p>Thank you for joining our platform. We're excited to help you find your dream job!</p>
      <p>Get started by:</p>
      <ul>
        <li><a href="${process.env.FRONTEND_URL}/profile">Complete your profile</a></li>
        <li><a href="${process.env.FRONTEND_URL}/jobs">Browse available jobs</a></li>
        <li>Set up job alerts to get notified about new opportunities</li>
      </ul>
      <p>Good luck with your job search!</p>
      <p>- The Job Portal Team</p>
    `
  }),
  
  applicationReceived: (jobTitle, company) => ({
    subject: 'Application Received!',
    html: `
      <h1>Application Submitted Successfully ✅</h1>
      <p>Your application for <strong>${jobTitle}</strong> at ${company} has been received.</p>
      <p>The recruiter will review your application and contact you if your profile matches their requirements.</p>
      <p>You can track your application status in your <a href="${process.env.FRONTEND_URL}/dashboard">dashboard</a>.</p>
    `
  }),
  
  applicationStatusChange: (jobTitle, status) => ({
    subject: `Application Status Update: ${status}`,
    html: `
      <h1>Your application status has been updated</h1>
      <p>Job: <strong>${jobTitle}</strong></p>
      <p>New Status: <strong>${status}</strong></p>
      <p><a href="${process.env.FRONTEND_URL}/dashboard">View your applications</a></p>
    `
  }),
  
  newJobAlert: (jobs) => ({
    subject: 'New Jobs Matching Your Criteria',
    html: `
      <h1>New Jobs Available! 🎯</h1>
      <p>We found ${jobs.length} new job(s) matching your saved search:</p>
      <ul>
        ${jobs.map(job => `
          <li>
            <strong>${job.title}</strong> at ${job.company.name}<br>
            Location: ${job.location.city}<br>
            <a href="${process.env.FRONTEND_URL}/jobs/${job._id}">View Job</a>
          </li>
        `).join('')}
      </ul>
      <p><a href="${process.env.FRONTEND_URL}/alerts">Manage your job alerts</a></p>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data = {}) => {
  try {
    const { subject, html } = emailTemplates[template](data);
    
    const mailOptions = {
      from: '"Job Portal Ethiopia" <noreply@jobportal.et>',
      to,
      subject,
      html
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    // For development, log the ethereal preview URL
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Email preview:', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

module.exports = { sendEmail };