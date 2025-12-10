import api from './api';
import type {Sessao, SessaoCompleta} from '../models/Sessao';
import type {Filme} from '../models/Filme';
import type {Sala} from '../models/Sala';

export const sessaoService = {
    getAll: async (): Promise<SessaoCompleta[]> => {
        const [sessoesResponse, filmesResponse, salasResponse] = await Promise.all([
            api.get<Sessao[]>('/sessoes'),
            api.get<Filme[]>('/filmes'),
            api.get<Sala[]>('/salas'),
        ]);

        const sessoes = sessoesResponse.data;
        const filmes = filmesResponse.data;
        const salas = salasResponse.data;

        return sessoes.map(sessao => ({
            ...sessao,
            filme: filmes.find(f => String(f.id) === String(sessao.filmeId)),
            sala: salas.find(s => String(s.id) === String(sessao.salaId)),
        })) as SessaoCompleta[];
    },

    getById: async (id: number): Promise<Sessao> => {
        const response = await api.get<Sessao>(`/sessoes/${id}`);
        return response.data;
    },

    create: async (sessao: Omit<Sessao, 'id'>): Promise<Sessao> => {
        const response = await api.post<Sessao>('/sessoes', sessao);
        return response.data;
    },

    update: async (id: number, sessao: Partial<Sessao>): Promise<Sessao> => {
        const response = await api.put<Sessao>(`/sessoes/${id}`, sessao);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/sessoes/${id}`);
    },
};

