import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {salaService} from '../../../services/salaService';
import type {Sala} from '../../../models/Sala';

export const SalasList = () => {
	const [salas, setSalas] = useState<Sala[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadSalas();
	}, []);

	const loadSalas = async () => {
		try {
			const data = await salaService.getAll();
			setSalas(data);
		} catch (error: any) {
			console.error('Erro ao carregar salas:', error);
			if (error.request) {
				alert('Erro: Não foi possível conectar ao servidor. Verifique se o json-server está rodando na porta 3000.');
			} else {
				alert('Erro ao carregar salas. Tente novamente.');
			}
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: number | string) => {
		if (window.confirm('Tem certeza que deseja excluir esta sala?')) {
			try {
				await salaService.delete(id as any);
				loadSalas();
			} catch (error: any) {
				console.error('Erro ao excluir sala:', error);
				if (error.response) {
					alert(`Erro: ${error.response.data?.message || 'Erro ao excluir sala'}`);
				} else if (error.request) {
					alert('Erro: Não foi possível conectar ao servidor.');
				} else {
					alert('Erro ao excluir sala. Tente novamente.');
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
					<i className="bi bi-door-open me-2"></i>
					Salas
				</h1>
				<Link to="/salas/novo" className="btn btn-primary">
					<i className="bi bi-plus-circle me-2"></i>
					Nova Sala
				</Link>
			</div>

			{salas.length === 0 ? (
				<div className="alert alert-info">
					<i className="bi bi-info-circle me-2"></i>
					Nenhuma sala cadastrada ainda.
				</div>
			) : (
				<div className="row">
					{salas.map((sala) => (
						<div key={sala.id} className="col-md-4 mb-4">
								<div className="card">
									<div className="card-body">
									<h5 className="card-title">
										<i className="bi bi-door-open me-2"></i>
										Sala {sala.numero}
									</h5>
									<p className="card-text">
										<i className="bi bi-people me-2"></i>
										Capacidade: {sala.capacidade} lugares
									</p>
									</div>
									<div className="card-footer d-flex gap-2">
										<Link
											to={`/salas/${sala.id}/editar`}
											className="btn btn-secondary btn-sm"
										>
											<i className="bi bi-pencil me-1"></i>
											Editar
										</Link>
										<button
											className="btn btn-danger btn-sm"
											onClick={() => sala.id && handleDelete(sala.id)}
										>
											<i className="bi bi-trash me-1"></i>
											Excluir
										</button>
									</div>
								</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

