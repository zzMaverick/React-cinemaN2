export interface Sessao {
    id?: number | string;
    horarioExibicao: string;
    filmeId: number | string;
    salaId: number | string;
}

export interface SessaoCompleta extends Sessao {
    filme?: {
        id: number;
        titulo: string;
    };
    sala?: {
        id: number;
        numero: number;
    };
}

