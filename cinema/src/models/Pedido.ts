import type { Ingresso } from './Ingresso';
import type { LancheCombo } from './LancheCombo';

export interface Pedido {
  id?: number | string;
  qtInteira: number;
  qtMeia: number;
  ingresso: Ingresso[];
  lanche: LancheCombo[];
  valorTotal: number;
}

