const twilioClient = require('../config/twilio');

const sendOtp = async (phone, otp) => {
  try {
    await twilioClient.messages.create({
      body: `Your CoreInventory password reset code is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
    return true;
  } catch (error) {
    console.error('Twilio SMS error:', error.message);
    throw new Error('Failed to send OTP');
  }
};

module.exports = { sendOtp };
