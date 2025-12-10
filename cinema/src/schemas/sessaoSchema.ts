import {z} from 'zod';

export const sessaoSchema = z.object({
    horarioExibicao: z.string().min(1, 'Data e horário são obrigatórios'),
    filmeId: z.union([
        z.number().int().positive('Selecione um filme'),
        z.string().min(1, 'Selecione um filme'),
    ]),
    salaId: z.union([
        z.number().int().positive('Selecione uma sala'),
        z.string().min(1, 'Selecione uma sala'),
    ]),
}).refine((data) => {
    const dataSessao = new Date(data.horarioExibicao);
    const agora = new Date();
    return dataSessao >= agora;
}, {
	message: 'A data da sessão não pode ser retroativa',
	path: ['horarioExibicao'],
});

export type SessaoFormData = z.infer<typeof sessaoSchema>;

