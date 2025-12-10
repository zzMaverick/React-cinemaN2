import api from './api';
import { ingressoService } from './ingressoService';
import type {Pedido} from '../models/Pedido';
import type {Ingresso} from '../models/Ingresso';
import type {LancheCombo} from '../models/LancheCombo';

export const pedidoService = {
	getAll: async (): Promise<Pedido[]> => {
		const response = await api.get<Pedido[]>('/pedidos');
		return response.data;
	},

	getById: async (id: number | string): Promise<Pedido> => {
		const response = await api.get<Pedido>(`/pedidos/${id}`);
		return response.data;
	},

	create: async (pedido: Omit<Pedido, 'id' | 'valorTotal'>): Promise<Pedido> => {

		const valorTotal = calcularValorTotal(pedido);
		const response = await api.post<Pedido>('/pedidos', {
			...pedido,
			valorTotal,
		});
		return response.data;
	},

	update: async (id: number | string, pedido: Partial<Pedido>): Promise<Pedido> => {
		const valorTotal = calcularValorTotal(pedido);
		const response = await api.put<Pedido>(`/pedidos/${id}`, {
			...pedido,
			valorTotal,
		});
		return response.data;
	},

    delete: async (id: number | string): Promise<void> => {
        try {
            const pedido = await pedidoService.getById(id);
            if (pedido && Array.isArray(pedido.ingresso)) {
                for (const i of pedido.ingresso) {
                    if (i.id != null) {
                        try {
                            await ingressoService.delete(i.id);
                        } catch (err) {
                            console.error('Falha ao excluir ingresso associado ao pedido', err);
                        }
                    }
                }
            }
        } catch (e) {
            console.warn('Não foi possível carregar pedido antes da exclusão, prosseguindo com delete.', e);
        }
        await api.delete(`/pedidos/${id}`);
    },

	adicionarIngresso: async (pedidoId: number | string, ingresso: Ingresso): Promise<Pedido> => {
		const pedido = await pedidoService.getById(pedidoId);
		const novosIngressos = [...pedido.ingresso, ingresso];
		const qtInteira = novosIngressos.filter(i => i.tipo === 'Inteira').length;
		const qtMeia = novosIngressos.filter(i => i.tipo === 'Meia').length;

		return pedidoService.update(pedidoId, {
			...pedido,
			ingresso: novosIngressos,
			qtInteira,
			qtMeia,
		});
	},

	removerIngresso: async (pedidoId: number | string, ingressoId: number | string): Promise<Pedido> => {
		const pedido = await pedidoService.getById(pedidoId);
		const novosIngressos = pedido.ingresso.filter(i => i.id !== ingressoId);
		const qtInteira = novosIngressos.filter(i => i.tipo === 'Inteira').length;
		const qtMeia = novosIngressos.filter(i => i.tipo === 'Meia').length;

		return pedidoService.update(pedidoId, {
			...pedido,
			ingresso: novosIngressos,
			qtInteira,
			qtMeia,
		});
	},

	adicionaLanche: async (pedidoId: number | string, lanche: LancheCombo): Promise<Pedido> => {
		const pedido = await pedidoService.getById(pedidoId);
		const novosLanches = [...pedido.lanche, lanche];

		return pedidoService.update(pedidoId, {
			...pedido,
			lanche: novosLanches,
		});
	},

	removerLanche: async (pedidoId: number | string, lancheId: number | string): Promise<Pedido> => {
		const pedido = await pedidoService.getById(pedidoId);
		const novosLanches = pedido.lanche.filter(l => l.id !== lancheId);

		return pedidoService.update(pedidoId, {
			...pedido,
			lanche: novosLanches,
		});
	},
};

function calcularValorTotal(pedido: Partial<Pedido>): number {
	const ingressos = Array.isArray(pedido.ingresso) ? pedido.ingresso : [];
	const lanches = Array.isArray(pedido.lanche) ? pedido.lanche : [];
	const valorIngressos = ingressos.reduce((total, ingresso) => total + (ingresso?.valorFinal ?? 0), 0);
	const valorLanches = lanches.reduce((total, lanche) => total + (lanche?.subtotal ?? 0), 0);
	return valorIngressos + valorLanches;
}

