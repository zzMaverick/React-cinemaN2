export const Genero = {
    ACAO: "Ação",
    AVENTURA: "Aventura",
    COMEDIA: "Comédia",
    DRAMA: "Drama",
    FICCAO: "Ficção Científica",
    TERROR: "Terror",
    ROMANCE: "Romance",
    ANIMACAO: "Animação"
} as const;

export type Genero = typeof Genero[keyof typeof Genero];

export interface Filme {
    id?: number;
    titulo: string;
    sinopse: string;
    classificacao: string;
    duracao: number;
    elenco: string;
    genero: Genero;
    dataInicioExibicao: string;
    dataFinalExibicao: string;
}

