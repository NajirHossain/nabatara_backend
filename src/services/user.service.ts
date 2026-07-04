import { UserRepository } from "../repository/user.repository.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import type { SignupInput, LoginInput } from "../interfaces/user.interface.js";
import {
  createAccessToken,
  createRefreshToken,
  validateRefreshToken,
} from "../utils/jwt.generator.js";

export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async signup(data: SignupInput) {
    if (!data.email && !data.contact_no) {
      throw new Error("Email or phone number is required");
    }
    if (!data.password) {
      throw new Error("Password is required");
    }

    const existingUser =
      (data.email && (await this.userRepo.findUserByEmail(data.email))) ||
      (data.contact_no && (await this.userRepo.findUserByPhone(data.contact_no)));

    if (existingUser) {
      throw new Error("User already exists");
    }

    const password_hash = await bcrypt.hash(data.password, 10);

    const createdUser = await this.userRepo.create({
      public_id: uuidv4(),
      name: data.name,
      contact_no: data.contact_no,
      email: data.email,
      role: "USER",
      password_hash,
    });

    const payload = { userId: createdUser.public_id, role: createdUser.role };
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);
    try {
      await this.userRepo.saveRefreshToken(createdUser.public_id, refreshToken);
    } catch {
      // Non-fatal: refresh token persistence failed (migration may not be run yet)
    }

    return { user: createdUser, accessToken, refreshToken };
  }

  async login(data: LoginInput) {
    if (!data.email && !data.contact_no) {
      throw new Error("Email or phone number is required");
    }
    if (!data.password) {
      throw new Error("Password is required");
    }

    const user =
      (data.email && (await this.userRepo.findUserByEmail(data.email))) ||
      (data.contact_no && (await this.userRepo.findUserByPhone(data.contact_no)));

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const ok = await bcrypt.compare(data.password, user.password_hash);
    if (!ok) {
      throw new Error("Invalid credentials");
    }

    if (user.email_verified === false) {
      throw new Error("EMAIL_NOT_VERIFIED");
    }

    const payload = { userId: user.public_id, role: user.role };
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);
    try {
      await this.userRepo.saveRefreshToken(user.public_id, refreshToken);
    } catch {
      // Non-fatal: refresh token persistence failed (migration may not be run yet)
    }

    const { password_hash, refresh_token, ...userWithoutSecrets } = user;
    return { user: userWithoutSecrets, accessToken, refreshToken };
  }

  async refresh(rawRefreshToken: string) {
    // Verify JWT signature first
    const payload = validateRefreshToken(rawRefreshToken);

    // Then confirm it still exists in DB (allows forced logout)
    const row = await this.userRepo.findByRefreshToken(rawRefreshToken);
    if (!row) {
      throw new Error("Refresh token revoked");
    }

    const newAccessToken = createAccessToken({ userId: row.public_id, role: row.role });
    return { accessToken: newAccessToken };
  }

  async logout(userId: string) {
    await this.userRepo.clearRefreshToken(userId);
    return { success: true };
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error("User not found");
    return { success: true, data: user };
  }

  async updateProfile(userId: string, data: { name?: string; contact_no?: string }) {
    const user = await this.userRepo.updateProfile(userId, data);
    if (!user) throw new Error("User not found");
    return { success: true, data: user };
  }
}
