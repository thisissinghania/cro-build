import { Resend } from "resend";
import ResetPasswordEmail from "@/components/emails/ResetPasswordEmail";
import VerifyEmailTemplate from "@/components/emails/VerifyEmailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);
const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const sendVerificationEmail = async (email: string, token: string, name: string) => {
  const confirmLink = `${domain}/auth/verify-email?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: "CROBuild <onboarding@resend.dev>", // Replace with your verified domain in production
    to: email,
    subject: "Confirm your email address - CROBuild",
    react: <VerifyEmailTemplate userFirstname={name || "User"} confirmLink={confirmLink} />,
  });

  if (error) {
    throw new Error(error.message);
  }
  
  return data;
};

export const sendPasswordResetEmail = async (email: string, token: string, name: string) => {
  const resetLink = `${domain}/auth/reset-password?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: "CROBuild <onboarding@resend.dev>", // Replace with your verified domain in production
    to: email,
    subject: "Reset your password - CROBuild",
    react: <ResetPasswordEmail userFirstname={name || "User"} resetPasswordLink={resetLink} />,
  });

  if (error) {
    throw new Error(error.message);
  }
  
  return data;
};
