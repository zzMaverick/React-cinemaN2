import {z} from 'zod';

export const pedidoSchema = z.object({
	qtInteira: z.number().int().min(0, 'Quantidade inteira deve ser maior ou igual a zero'),
	qtMeia: z.number().int().min(0, 'Quantidade meia deve ser maior ou igual a zero'),
}).refine((data) => data.qtInteira > 0 || data.qtMeia > 0, {
	message: 'Pelo menos uma quantidade de ingresso deve ser maior que zero',
	path: ['qtInteira'],
});

export type PedidoFormData = z.infer<typeof pedidoSchema>;

