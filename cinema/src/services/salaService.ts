import api from './api';
import type { Sala } from '../models/Sala';

export const salaService = {
  getAll: async (): Promise<Sala[]> => {
    const response = await api.get<Sala[]>('/salas');
    return response.data;
  },

  getById: async (id: number): Promise<Sala> => {
    const response = await api.get<Sala>(`/salas/${id}`);
    return response.data;
  },

  create: async (sala: Omit<Sala, 'id'>): Promise<Sala> => {
    const response = await api.post<Sala>('/salas', sala);
    return response.data;
  },

  update: async (id: number, sala: Partial<Sala>): Promise<Sala> => {
    const response = await api.put<Sala>(`/salas/${id}`, sala);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/salas/${id}`);
  },
};

