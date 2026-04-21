import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(6, "A senha deve ter no mínimo 6 caracteres")
  .max(20, "A senha pode ter no máximo 20 caracteres")
  .regex(/^\S+$/, "A senha não pode conter espaços");