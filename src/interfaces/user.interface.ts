export interface User {
  public_id: string;
  name: string | null;
  contact_no: string | null;
  email: string;
  role: "USER" | "ADMIN";
  password_hash: string;
}

export interface SignupInput {
  name?: string;
  contact_no?: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
  contact_no?: string;
}

export type PublicUser = Omit<User, "password_hash">;