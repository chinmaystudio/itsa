import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[^\r\n<>]+$/, "Please enter a valid name"),
  email: z.string().trim().email().max(320),
  subject: z.string().trim().min(3).max(200),
  message: z.string().trim().min(10).max(5000),
});
