import { z } from 'zod';

export const salaSchema = z.object({
  numero: z.number().int().positive('Número da sala deve ser um número positivo'),
  capacidade: z.number().int().positive('Capacidade deve ser um número positivo maior que 0'),
});

export type SalaFormData = z.infer<typeof salaSchema>;

