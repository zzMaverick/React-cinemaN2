import api from './api';
import type {Ingresso} from '../models/Ingresso';

export const ingressoService = {
    getAll: async (): Promise<Ingresso[]> => {
        const response = await api.get<Ingresso[]>('/ingressos');
        return response.data;
    },

    getById: async (id: number | string): Promise<Ingresso> => {
        const response = await api.get<Ingresso>(`/ingressos/${id}`);
        return response.data;
    },

    create: async (ingresso: Omit<Ingresso, 'id'>): Promise<Ingresso> => {
        const response = await api.post<Ingresso>('/ingressos', ingresso);
        return response.data;
    },

    delete: async (id: number | string): Promise<void> => {
        await api.delete(`/ingressos/${id}`);
    },
};

