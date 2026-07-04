import type { Request, Response } from "express";
import { UserService } from "../services/user.service.js";
import { UserRepository } from "../repository/user.repository.js";

const REFRESH_COOKIE = "nabatara_refresh";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

export class UserController {
  private readonly userService: UserService;

  constructor() {
    const userRepo = new UserRepository();
    this.userService = new UserService(userRepo);
  }

  signup = async (req: Request, res: Response): Promise<void> => {
    try {
      const { user, accessToken, refreshToken } = await this.userService.signup(req.body);
      res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: { user, accessToken },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      const isValidationError = msg.includes("required") || msg === "User already exists";
      res.status(isValidationError ? 400 : 500).json({ success: false, message: msg });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { user, accessToken, refreshToken } = await this.userService.login(req.body);
      res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
      res.status(200).json({
        success: true,
        message: "Login successful",
        data: { user, accessToken },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      const isAuthError = msg === "Invalid credentials" || msg === "Email or phone number is required" || msg === "Password is required";
      res.status(isAuthError ? 401 : 500).json({ success: false, message: msg });
    }
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = req.cookies?.[REFRESH_COOKIE];
      if (!token) {
        res.status(401).json({ success: false, message: "No refresh token" });
        return;
      }
      const { accessToken } = await this.userService.refresh(token);
      res.status(200).json({ success: true, data: { accessToken } });
    } catch {
      res.clearCookie(REFRESH_COOKIE);
      res.status(401).json({ success: false, message: "Invalid refresh token" });
    }
  };

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const result = await this.userService.getProfile(userId);
      res.status(200).json(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      res.status(404).json({ success: false, message: msg });
    }
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { name, contact_no } = req.body;
      const result = await this.userService.updateProfile(userId, { name, contact_no });
      res.status(200).json(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      res.status(400).json({ success: false, message: msg });
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = req.cookies?.[REFRESH_COOKIE];
      if (token) {
        // Best-effort DB clear; ignore errors (token may already be expired)
        const { UserRepository: Repo } = await import("../repository/user.repository.js");
        const repo = new Repo();
        const row = await repo.findByRefreshToken(token);
        if (row) await repo.clearRefreshToken(row.public_id);
      }
      res.clearCookie(REFRESH_COOKIE);
      res.status(200).json({ success: true, message: "Logout successful" });
    } catch {
      res.clearCookie(REFRESH_COOKIE);
      res.status(200).json({ success: true, message: "Logout successful" });
    }
  };
}
