import { z } from "zod";
const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "username cannot exceed 30 characters"),
  password: z.string().min(8, "Password needs to be at least 8 character"),
  role: z.enum(["admin", "viewer", "guest"]).optional().default("viewer"),
});

const postSchema = z.object({
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(100, "The title can be a maximum of 100 characters"),
  content: z.string().min(1, "Content is required"),
});

const commentSchema = z.object({
  content: z
    .string()
    .min(1, "comment can not be empty")
    .max(500, "comment can only be 500 characters long"),
});

export { registerSchema, postSchema, commentSchema };
