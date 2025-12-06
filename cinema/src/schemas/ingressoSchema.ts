import { z } from 'zod';
import { TipoIngresso } from '../models/Ingresso';

export const ingressoSchema = z.object({
  tipo: z.enum([TipoIngresso.INTEIRA, TipoIngresso.MEIA] as [string, ...string[]], {
    message: 'Tipo de ingresso é obrigatório',
  }),
  valorInteira: z.number().positive('Valor inteira deve ser positivo'),
  valorMeia: z.number().positive('Valor meia deve ser positivo'),
  sessaoId: z.union([z.number().int().positive('Sessão é obrigatória'), z.string().min(1, 'Sessão é obrigatória')]),
});

export type IngressoFormData = z.infer<typeof ingressoSchema>;

