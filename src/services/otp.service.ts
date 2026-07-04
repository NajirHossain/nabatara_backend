import bcrypt from "bcrypt";
import { UserRepository } from "../repository/user.repository.js";
import * as otpRepo from "../repository/otp.repository.js";
import { sendOTPEmail } from "../utils/mailer.js";

const userRepo = new UserRepository();

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function expiresIn10Min(): Date {
  return new Date(Date.now() + 10 * 60 * 1000);
}

export async function sendEmailVerificationOTP(email: string): Promise<void> {
  const user = await userRepo.findUserByEmail(email);
  if (!user) throw new Error("No account found with this email");
  if (user.email_verified) throw new Error("Email is already verified");

  const code = generateCode();
  await otpRepo.createOTP(email, code, "email_verification", expiresIn10Min());
  await sendOTPEmail(email, code, "email_verification");
}

export async function sendPasswordResetOTP(email: string): Promise<void> {
  const user = await userRepo.findUserByEmail(email);
  if (!user) throw new Error("No account found with this email");

  const code = generateCode();
  await otpRepo.createOTP(email, code, "password_reset", expiresIn10Min());
  await sendOTPEmail(email, code, "password_reset");
}

export async function verifyEmailOTP(email: string, code: string): Promise<void> {
  const record = await otpRepo.findValidOTP(email, code, "email_verification");
  if (!record) throw new Error("Invalid or expired OTP");

  await otpRepo.markUsed(record.id);
  await userRepo.setEmailVerified(email);
}

export async function resetPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<void> {
  if (!newPassword || newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const record = await otpRepo.findValidOTP(email, code, "password_reset");
  if (!record) throw new Error("Invalid or expired OTP");

  const hash = await bcrypt.hash(newPassword, 10);
  await otpRepo.markUsed(record.id);
  await userRepo.updatePassword(email, hash);
}
