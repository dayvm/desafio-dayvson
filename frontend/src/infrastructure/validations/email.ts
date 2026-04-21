import { z } from "zod";

export const emailSchema = z
  .string()
  .min(1, "O E-mail é obrigatório")
  .email("Formato de e-mail inválido");