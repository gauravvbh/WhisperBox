import { z } from "zod";


export const userNameValidation = z
  .string()
  .min(2, { message: "Username must be at least 2 characters" })
  .max(20, { message: "Username must be at most 20 characters" })
  .regex(/^[a-zA-Z0-9_-]+$/, { message: "Username can only contain alphanumeric characters, underscores, and hyphens" })


export const passwordValidation = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .max(64, { message: "Password must be at most 64 characters" })
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character" })



export const emailValidation = z
  .string()
  .email({ message: "Invalid email address" })



export const signUpValidation = z.object({
  username: userNameValidation,
  password: passwordValidation,
  email: emailValidation,
})