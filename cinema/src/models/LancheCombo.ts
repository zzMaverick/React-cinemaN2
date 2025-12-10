export interface LancheCombo {
	id?: number | string;
	nome: string;
	descricao: string;
	valorUnitario: number;
	qtUnidade: number;
	qtDisponivel?: number;
	subtotal: number;
}

