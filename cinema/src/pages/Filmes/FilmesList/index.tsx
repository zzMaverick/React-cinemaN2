import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {filmeService} from '../../../services/filmeService';
import type {Filme} from '../../../models/Filme';

export const FilmesList = () => {
	const [filmes, setFilmes] = useState<Filme[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadFilmes();
	}, []);

	const loadFilmes = async () => {
		try {
			const data = await filmeService.getAll();
			setFilmes(data);
		} catch (error: any) {
			console.error('Erro ao carregar filmes:', error);
			if (error.request) {
				alert('Erro: Não foi possível conectar ao servidor. Verifique se o json-server está rodando na porta 3000.');
			} else {
				alert('Erro ao carregar filmes. Tente novamente.');
			}
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: number) => {
		if (window.confirm('Tem certeza que deseja excluir este filme?')) {
			try {
				await filmeService.delete(id);
				loadFilmes();
			} catch (error: any) {
				console.error('Erro ao excluir filme:', error);
				if (error.response) {
					alert(`Erro: ${error.response.data?.message || 'Erro ao excluir filme'}`);
				} else if (error.request) {
					alert('Erro: Não foi possível conectar ao servidor.');
				} else {
					alert('Erro ao excluir filme. Tente novamente.');
				}
			}
		}
	};

	if (loading) {
		return <div className="text-center mt-5">Carregando...</div>;
	}

	return (
		<div className="container mt-4">
			<div className="d-flex justify-content-between align-items-center mb-4">
				<h1>
					<i className="bi bi-film me-2"></i>
					Filmes
				</h1>
				<Link to="/filmes/novo" className="btn btn-primary">
					<i className="bi bi-plus-circle me-2"></i>
					Novo Filme
				</Link>
			</div>

			{filmes.length === 0 ? (
				<div className="alert alert-info">
					<i className="bi bi-info-circle me-2"></i>
					Nenhum filme cadastrado ainda.
				</div>
			) : (
				<div className="row">
					{filmes.map((filme) => (
						<div key={filme.id} className="col-md-4 mb-4">
							<div className="card h-100">
								<div className="card-body">
									<h5 className="card-title">{filme.titulo}</h5>
									<p className="card-text">
										<small className="text-muted">
											<i className="bi bi-tag me-1"></i>
											{filme.genero}
										</small>
									</p>
									<p className="card-text">
										<small className="text-muted">
											<i className="bi bi-clock me-1"></i>
											{filme.duracao} min
										</small>
									</p>
									<p className="card-text">
										<small className="text-muted">
											<i className="bi bi-star me-1"></i>
											{filme.classificacao}
										</small>
									</p>
									<p className="card-text">{filme.sinopse}</p>
								</div>
								<div className="card-footer">
									<div className="d-flex gap-2">
										<Link
											to={`/filmes/${filme.id}/editar`}
											className="btn btn-secondary btn-sm"
										>
											<i className="bi bi-pencil me-1"></i>
											Editar
										</Link>
										<button
											className="btn btn-danger btn-sm"
											onClick={() => filme.id && handleDelete(filme.id)}
										>
											<i className="bi bi-trash me-1"></i>
											Excluir
										</button>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

