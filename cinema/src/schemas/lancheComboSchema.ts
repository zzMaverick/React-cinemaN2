import { z } from 'zod';

export const lancheComboSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  valorUnitario: z.number().positive('Valor unitário deve ser positivo'),
  qtUnidade: z.number().int().positive('Quantidade deve ser um número inteiro positivo'),
});

export type LancheComboFormData = z.infer<typeof lancheComboSchema>;

