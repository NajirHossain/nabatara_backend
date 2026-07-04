import type { Request, Response, NextFunction } from "express";
import { validateToken, validateRefreshToken, createAccessToken, createRefreshToken } from "../utils/jwt.generator.js";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const accessToken = req.cookies?.access_token;
  const refreshToken = req.cookies?.refresh_token;

  if (!accessToken && !refreshToken) {
    res.status(401).json({ error: "NOT_AUTHENTICATED" });
    return;
  }

  // 1️⃣ Try Access Token
  if (accessToken) {
    try {
      const decoded = validateToken(accessToken);
      req.user = decoded;
      next();
      return;
    } catch (err) {
      // Access token invalid or expired, gracefully fall through to check refresh token
    }
  }

  // 2️⃣ Validate Refresh Token
  if (!refreshToken) {
    res.status(401).json({ error: "SESSION_EXPIRED" });
    return;
  }

  try {
    const decoded = validateRefreshToken(refreshToken);

    // Issue new tokens using the utility
    const newAccessToken = createAccessToken(
      { userId: decoded.userId, role: decoded.role }
    );

    const newRefreshToken = createRefreshToken(
      { userId: decoded.userId, role: decoded.role }
    );

    const isProduction = process.env.NODE_ENV === "production";

    // Set cookies
    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      secure: isProduction, // set false in local dev without HTTPS
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "INVALID_REFRESH_TOKEN" });
    return;
  }
}
