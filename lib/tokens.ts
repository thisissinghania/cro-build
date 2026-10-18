import { v4 as uuidv4 } from "uuid";
import { prisma } from "./db";

export const generateVerificationToken = async (email: string) => {
  const cleanEmail = email.trim().toLowerCase();
  const token = uuidv4();
  // Expires in 1 hour
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  // Atomically delete any existing verification tokens for this email to avoid duplicates/stale links
  await prisma.verificationToken.deleteMany({
    where: { email: cleanEmail },
  });

  const verificationToken = await prisma.verificationToken.create({
    data: {
      email: cleanEmail,
      token,
      expires,
    },
  });

  return verificationToken;
};

export const generatePasswordResetToken = async (email: string) => {
  const cleanEmail = email.trim().toLowerCase();
  const token = uuidv4();
  // Expires in 1 hour
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  // Atomically delete any existing password reset tokens for this email to avoid duplicates/stale links
  await prisma.passwordResetToken.deleteMany({
    where: { email: cleanEmail },
  });

  const passwordResetToken = await prisma.passwordResetToken.create({
    data: {
      email: cleanEmail,
      token,
      expires,
    },
  });

  return passwordResetToken;
};
