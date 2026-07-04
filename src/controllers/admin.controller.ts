import type { Request, Response } from "express";
import { randomBytes } from "crypto";
import pool from "../config/dbconnect.js";
import { ordersRepository } from "../repository/orders.repository.js";
import * as adminRepo from "../repository/admin.repository.js";
import { UserRepository } from "../repository/user.repository.js";
import { sendAdminInviteEmail, sendAdminWelcomeEmail } from "../utils/mailer.js";

const userRepo = new UserRepository();

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";

class AdminController {
  getOrders = async (_req: Request, res: Response): Promise<void> => {
    try {
      const orders = await ordersRepository.getAllOrders();
      res.status(200).json({ success: true, data: orders });
    } catch (error) {
      res.status(500).json({ success: false, message: error instanceof Error ? error.message : "Failed to fetch orders" });
    }
  };

  getStats = async (_req: Request, res: Response): Promise<void> => {
    try {
      const [usersRes, ordersRes, productsRes] = await Promise.all([
        pool.query(`SELECT COUNT(*) AS count FROM users`),
        pool.query(`SELECT COUNT(*) AS count, COALESCE(SUM(total_amount), 0) AS revenue FROM orders`),
        pool.query(`SELECT COUNT(*) AS count FROM products`),
      ]);
      res.status(200).json({
        success: true,
        data: {
          totalUsers: parseInt(usersRes.rows[0].count as string, 10),
          totalOrders: parseInt(ordersRes.rows[0].count as string, 10),
          totalRevenue: parseFloat(ordersRes.rows[0].revenue as string),
          totalProducts: parseInt(productsRes.rows[0].count as string, 10),
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error instanceof Error ? error.message : "Failed to fetch stats" });
    }
  };

  listUsers = async (_req: Request, res: Response): Promise<void> => {
    try {
      const users = await adminRepo.listUsers();
      res.status(200).json({ success: true, data: users });
    } catch (err) {
      res.status(500).json({ success: false, message: err instanceof Error ? err.message : "Failed to fetch users" });
    }
  };

  updateUserRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId as string;
      const { role } = req.body as { role?: string };
      if (role !== "USER" && role !== "ADMIN") {
        res.status(400).json({ success: false, message: "Role must be USER or ADMIN" });
        return;
      }
      // Prevent admin from demoting themselves
      if (req.user?.userId === userId && role === "USER") {
        res.status(400).json({ success: false, message: "You cannot remove your own admin access" });
        return;
      }
      await adminRepo.setUserRole(userId, role);
      if (role === "ADMIN") {
        const user = await userRepo.findById(userId);
        if (user?.email) {
          sendAdminWelcomeEmail(user.email).catch(() => {});
        }
      }
      res.status(200).json({ success: true, message: `User role updated to ${role}` });
    } catch (err) {
      res.status(500).json({ success: false, message: err instanceof Error ? err.message : "Failed to update role" });
    }
  };

  inviteAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body as { email?: string };
      if (!email || !email.includes("@")) {
        res.status(400).json({ success: false, message: "Valid email is required" });
        return;
      }
      const inviterUserId = req.user?.userId ?? "";
      const inviter = await userRepo.findById(inviterUserId);
      const inviterName = inviter?.name ?? "A NabataraLife admin";

      const existingUser = await userRepo.findUserByEmail(email.toLowerCase().trim());
      if (existingUser) {
        // User exists — promote directly + send welcome email
        await adminRepo.setUserRole(existingUser.public_id, "ADMIN");
        sendAdminWelcomeEmail(email).catch(() => {});
        res.status(200).json({ success: true, message: "User promoted to admin and notified by email" });
        return;
      }

      // User doesn't exist — create an invite link (48h expiry)
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
      await adminRepo.createInvite(email.toLowerCase().trim(), token, inviterUserId, expiresAt);
      const inviteUrl = `${FRONTEND_URL}/accept-invite?token=${token}`;
      await sendAdminInviteEmail(email, inviterName, inviteUrl);
      res.status(200).json({ success: true, message: "Invite email sent successfully" });
    } catch (err) {
      res.status(500).json({ success: false, message: err instanceof Error ? err.message : "Failed to send invite" });
    }
  };

  // Public route — called when user clicks the invite link
  acceptInvite = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = req.query.token as string;
      if (!token) { res.status(400).json({ success: false, message: "Token is required" }); return; }

      const invite = await adminRepo.findInviteByToken(token);
      if (!invite || invite.accepted || new Date(invite.expires_at) < new Date()) {
        res.status(400).json({ success: false, message: "Invalid or expired invite link" });
        return;
      }

      await adminRepo.markInviteAccepted(token);

      // If user already signed up in the meantime, promote them
      const user = await userRepo.findUserByEmail(invite.email);
      if (user) {
        await adminRepo.setUserRole(user.public_id, "ADMIN");
      }

      res.status(200).json({
        success: true,
        message: user
          ? "Admin access granted. You can now sign in."
          : "Invite accepted. Please sign up to complete your admin account.",
        data: { email: invite.email, userExists: !!user },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err instanceof Error ? err.message : "Failed to accept invite" });
    }
  };
}

export const adminController = new AdminController();
