export const TipoIngresso = {
  INTEIRA: "Inteira",
  MEIA: "Meia"
} as const;

export type TipoIngresso = typeof TipoIngresso[keyof typeof TipoIngresso];

export interface Ingresso {
  id?: number | string;
  valorInteira: number;
  valorMeia: number;
  tipo: TipoIngresso;
  sessaoId: number | string;
  valorFinal: number;
}

