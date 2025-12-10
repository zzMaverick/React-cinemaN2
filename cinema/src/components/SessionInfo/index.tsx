import type { SessaoCompleta } from '../../models/Sessao';

interface ISessionInfoProps {
	sessao: SessaoCompleta;
}

export const SessionInfo = ({ sessao }: ISessionInfoProps) => {
	return (
		<div className="card mb-3">
			<div className="card-header">
				<h6 className="mb-0">
					<i className="bi bi-info-circle me-2"></i>
					Informações da Sessão
				</h6>
			</div>
			<div className="card-body">
				<div className="row">
					<div className="col-md-6">
						<p><strong>Filme:</strong> {sessao.filme?.titulo || 'N/A'}</p>
					</div>
					<div className="col-md-6">
						<p><strong>Sala:</strong> {sessao.sala?.numero || 'N/A'}</p>
					</div>
				</div>
				<p><strong>Horário:</strong> {new Date(sessao.horarioExibicao).toLocaleString('pt-BR')}</p>
			</div>
		</div>
	);
};
