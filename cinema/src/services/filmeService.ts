import api from './api';
import type {Filme} from '../models/Filme';

export const filmeService = {
    getAll: async (): Promise<Filme[]> => {
        const response = await api.get<Filme[]>('/filmes');
        return response.data;
    },

    getById: async (id: number): Promise<Filme> => {
        const response = await api.get<Filme>(`/filmes/${id}`);
        return response.data;
    },

    create: async (filme: Omit<Filme, 'id'>): Promise<Filme> => {
        const response = await api.post<Filme>('/filmes', filme);
        return response.data;
    },

    update: async (id: number, filme: Partial<Filme>): Promise<Filme> => {
        const response = await api.put<Filme>(`/filmes/${id}`, filme);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/filmes/${id}`);
    },
};

