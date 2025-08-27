import twilio from "twilio";
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID } from "../constants.js";

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export const sendOTP = async (phone_number) => {
  try {
    const verification = await client.verify.v2
      .services(TWILIO_SERVICE_SID)
      .verifications.create({ to: phone_number, channel: "sms" });

    return { success: true, sid: verification.sid };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const verifyOTP = async ({ phone_number, otp }) => {
  try {
    const verificationCheck = await client.verify.v2
      .services(TWILIO_SERVICE_SID)
      .verificationChecks.create({ to: phone_number, code: otp });

    return { success: verificationCheck.status === "approved" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};