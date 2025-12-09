import api from './api';
import type { LancheCombo } from '../models/LancheCombo';

export const lancheComboService = {
  getAll: async (): Promise<LancheCombo[]> => {
    const response = await api.get<LancheCombo[]>('/lancheCombos');
    return response.data;
  },

  getById: async (id: number): Promise<LancheCombo> => {
    const response = await api.get<LancheCombo>(`/lancheCombos/${id}`);
    return response.data;
  },

  create: async (lancheCombo: Omit<LancheCombo, 'id' | 'subtotal'>): Promise<LancheCombo> => {
    const subtotal = lancheCombo.valorUnitario * lancheCombo.qtUnidade;
    const response = await api.post<LancheCombo>('/lancheCombos', {
      ...lancheCombo,
      subtotal,
    });
    return response.data;
  },

  update: async (id: number, lancheCombo: Omit<LancheCombo, 'id' | 'subtotal'>): Promise<LancheCombo> => {
    const subtotal = lancheCombo.valorUnitario * lancheCombo.qtUnidade;
    const response = await api.put<LancheCombo>(`/lancheCombos/${id}`, {
      ...lancheCombo,
      subtotal,
    });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/lancheCombos/${id}`);
  },
};

