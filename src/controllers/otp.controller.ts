import type { Request, Response } from "express";
import * as otpService from "../services/otp.service.js";

function sanitizeEmail(raw: unknown): string | undefined {
  return typeof raw === "string" ? raw.trim().toLowerCase() : undefined;
}
function sanitizeCode(raw: unknown): string | undefined {
  return typeof raw === "string" ? raw.trim() : undefined;
}

export async function sendVerificationOTP(req: Request, res: Response): Promise<void> {
  try {
    const email = sanitizeEmail(req.body.email);
    if (!email) { res.status(400).json({ success: false, message: "Email is required" }); return; }
    await otpService.sendEmailVerificationOTP(email);
    res.status(200).json({ success: true, message: "Verification code sent to your email" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to send OTP";
    res.status(400).json({ success: false, message: msg });
  }
}

export async function verifyEmail(req: Request, res: Response): Promise<void> {
  try {
    const email = sanitizeEmail(req.body.email);
    const code  = sanitizeCode(req.body.code);
    if (!email || !code) { res.status(400).json({ success: false, message: "Email and code are required" }); return; }
    await otpService.verifyEmailOTP(email, code);
    res.status(200).json({ success: true, message: "Email verified successfully" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Verification failed";
    res.status(400).json({ success: false, message: msg });
  }
}

export async function sendPasswordResetOTP(req: Request, res: Response): Promise<void> {
  try {
    const email = sanitizeEmail(req.body.email);
    if (!email) { res.status(400).json({ success: false, message: "Email is required" }); return; }
    await otpService.sendPasswordResetOTP(email);
    res.status(200).json({ success: true, message: "Password reset code sent to your email" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to send OTP";
    res.status(400).json({ success: false, message: msg });
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const email       = sanitizeEmail(req.body.email);
    const code        = sanitizeCode(req.body.code);
    const newPassword = typeof req.body.newPassword === "string" ? req.body.newPassword : undefined;
    if (!email || !code || !newPassword) {
      res.status(400).json({ success: false, message: "Email, code, and new password are required" });
      return;
    }
    await otpService.resetPassword(email, code, newPassword);
    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Reset failed";
    res.status(400).json({ success: false, message: msg });
  }
}
