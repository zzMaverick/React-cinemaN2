import api from './api';
import type {LancheCombo} from '../models/LancheCombo';

export const lancheComboService = {
	getAll: async (): Promise<LancheCombo[]> => {
		const response = await api.get<LancheCombo[]>('/lancheCombos');
		return response.data;
	},

	getById: async (id: number | string): Promise<LancheCombo> => {
		const response = await api.get<LancheCombo>(`/lancheCombos/${id}`);
		return response.data;
	},

	create: async (
		lancheCombo: Omit<LancheCombo, 'id' | 'subtotal' | 'qtDisponivel'> & { qtDisponivel?: number }
	): Promise<LancheCombo> => {
		const subtotal = lancheCombo.valorUnitario * lancheCombo.qtUnidade;
		const qtDisponivel = (lancheCombo as Partial<LancheCombo>).qtDisponivel ?? lancheCombo.qtUnidade;
		const response = await api.post<LancheCombo>('/lancheCombos', {
			...lancheCombo,
			subtotal,
			qtDisponivel,
		});
		return response.data;
	},

	update: async (
		id: number | string,
		lancheCombo: Omit<LancheCombo, 'id' | 'subtotal' | 'qtDisponivel'> & { qtDisponivel?: number }
	): Promise<LancheCombo> => {
		const subtotal = lancheCombo.valorUnitario * lancheCombo.qtUnidade;
		const qtDisponivel = (lancheCombo as Partial<LancheCombo>).qtDisponivel ?? lancheCombo.qtUnidade;
		const response = await api.put<LancheCombo>(`/lancheCombos/${id}`,
			{
				...lancheCombo,
				subtotal,
				qtDisponivel,
			});
		return response.data;
	},

	delete: async (id: number | string): Promise<void> => {
		await api.delete(`/lancheCombos/${id}`);
	},
};

