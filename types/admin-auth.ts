export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  avatar?: string;
  role: "Super Admin" | "Admin";
  lastLogin: Date;
  emailVerified: boolean;
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  token: string;
  admin: AdminResponse;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface SimpleResponse {
  success: boolean;
  message: string;
}
