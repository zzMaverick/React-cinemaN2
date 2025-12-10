import {z} from 'zod';
import {Genero} from '../models/Filme';

export const filmeSchema = z.object({
    titulo: z.string().min(1, 'Título é obrigatório'),
    sinopse: z.string().min(10, 'Sinopse deve ter no mínimo 10 caracteres'),
    classificacao: z.string().min(1, 'Classificação é obrigatória'),
    duracao: z.number().positive('Duração deve ser um número positivo maior que 0'),
    elenco: z.string().min(1, 'Elenco é obrigatório'),
    genero: z.enum([Genero.ACAO, Genero.AVENTURA, Genero.COMEDIA, Genero.DRAMA, Genero.FICCAO, Genero.TERROR, Genero.ROMANCE, Genero.ANIMACAO] as [string, ...string[]], {
        message: 'Gênero é obrigatório',
    }),
    dataInicioExibicao: z.string().min(1, 'Data de início é obrigatória'),
    dataFinalExibicao: z.string().min(1, 'Data final é obrigatória'),
}).refine((data) => {
    const inicio = new Date(data.dataInicioExibicao);
    const fim = new Date(data.dataFinalExibicao);
    return fim >= inicio;
}, {
    message: 'Data final deve ser posterior ou igual à data de início',
    path: ['dataFinalExibicao'],
});

export type FilmeFormData = z.infer<typeof filmeSchema>;

