import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {sessaoService} from '../../../services/sessaoService';
import type {SessaoCompleta} from '../../../models/Sessao';
import {VenderIngressoModal} from '../VenderIngressoModal';

export const SessoesList = () => {
	const [sessoes, setSessoes] = useState<SessaoCompleta[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedSessao, setSelectedSessao] = useState<SessaoCompleta | null>(null);
	const [showModal, setShowModal] = useState(false);

	useEffect(() => {
		loadSessoes();
	}, []);

	const loadSessoes = async () => {
		try {
			const data = await sessaoService.getAll();
			setSessoes(data);
		} catch (error: any) {
			console.error('Erro ao carregar sessões:', error);
			if (error.request) {
				alert('Erro: Não foi possível conectar ao servidor. Verifique se o json-server está rodando na porta 3000.');
			} else {
				alert('Erro ao carregar sessões. Tente novamente.');
			}
		} finally {
			setLoading(false);
		}
	};

	const handleVenderIngresso = (sessao: SessaoCompleta) => {
		setSelectedSessao(sessao);
		setShowModal(true);
	};

	const handleDelete = async (id: number | string) => {
		if (window.confirm('Tem certeza que deseja excluir esta sessão?')) {
			try {
				await sessaoService.delete(id as any);
				loadSessoes();
			} catch (error: any) {
				console.error('Erro ao excluir sessão:', error);
				if (error.response) {
					alert(`Erro: ${error.response.data?.message || 'Erro ao excluir sessão'}`);
				} else if (error.request) {
					alert('Erro: Não foi possível conectar ao servidor.');
				} else {
					alert('Erro ao excluir sessão. Tente novamente.');
				}
			}
		}
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setSelectedSessao(null);
	};

	const formatDateTime = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleString('pt-BR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	if (loading) {
		return <div className="text-center mt-5">Carregando...</div>;
	}

	return (
		<>
			<div className="container mt-4">
				<div className="d-flex justify-content-between align-items-center mb-4">
					<h1>
						<i className="bi bi-calendar-event me-2"></i>
						Sessões
					</h1>
					<Link to="/sessoes/novo" className="btn btn-primary">
						<i className="bi bi-plus-circle me-2"></i>
						Nova Sessão
					</Link>
				</div>

				{sessoes.length === 0 ? (
					<div className="alert alert-info">
						<i className="bi bi-info-circle me-2"></i>
						Nenhuma sessão agendada ainda.
					</div>
				) : (
					<div className="table-responsive">
						<table className="table table-striped">
							<thead>
							<tr>
								<th>Filme</th>
								<th>Sala</th>
								<th>Data e Horário</th>
								<th>Ações</th>
							</tr>
							</thead>
							<tbody>
							{sessoes.map((sessao) => (
								<tr key={sessao.id}>
									<td>
										<i className="bi bi-film me-2"></i>
										{sessao.filme?.titulo || 'N/A'}
									</td>
									<td>
										<i className="bi bi-door-open me-2"></i>
										Sala {sessao.sala?.numero || 'N/A'}
									</td>
									<td>
										<i className="bi bi-clock me-2"></i>
										{formatDateTime(sessao.horarioExibicao)}
									</td>
									<td>
										<div className="d-flex gap-2">
											<Link
												to={`/sessoes/${sessao.id}/editar`}
												className="btn btn-secondary btn-sm"
											>
												<i className="bi bi-pencil me-1"></i>
												Editar
											</Link>
											<button
												className="btn btn-success btn-sm"
												onClick={() => handleVenderIngresso(sessao)}
											>
												<i className="bi bi-ticket-perforated me-1"></i>
												Vender Ingresso
											</button>
											<button
												className="btn btn-danger btn-sm"
												onClick={() => sessao.id && handleDelete(sessao.id)}
											>
												<i className="bi bi-trash me-1"></i>
												Excluir
											</button>
										</div>
									</td>
								</tr>
							))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{selectedSessao && (
				<VenderIngressoModal
					sessao={selectedSessao}
					show={showModal}
					onClose={handleCloseModal}
					onSuccess={loadSessoes}
				/>
			)}
		</>
	);
};

