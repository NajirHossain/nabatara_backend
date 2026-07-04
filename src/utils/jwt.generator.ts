import jwt, { type JwtPayload } from "jsonwebtoken";

export interface TokenPayload extends JwtPayload {
  userId: string;
  role: string;
}

export function createAccessToken(payload: TokenPayload): string {
  return jwt.sign(
    { userId: payload.userId, role: payload.role },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: "15m" },
  );
}

export function createRefreshToken(payload: TokenPayload): string {
  return jwt.sign(
    { userId: payload.userId, role: payload.role },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: "30d" },
  );
}

export function validateToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
  if (typeof decoded === "string") throw new Error("Invalid token payload");
  return decoded as TokenPayload;
}

export function validateRefreshToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string);
  if (typeof decoded === "string") throw new Error("Invalid token payload");
  return decoded as TokenPayload;
}

// Legacy alias kept for any callers not yet updated
export const createToken = createAccessToken;
