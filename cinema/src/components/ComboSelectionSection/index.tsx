import { Button } from '../Button';
import type { LancheCombo } from '../../models/LancheCombo';

interface IComboSelectionSectionProps {
	lanchesDisponiveis: LancheCombo[];
	lanchesSelecionados: LancheCombo[];
	onAddLanche: (lanche: LancheCombo) => void;
	onRemoveLanche: (index: number) => void;
	totalCombos: number;
	error?: string;
}

export const ComboSelectionSection = ({
	lanchesDisponiveis,
	lanchesSelecionados,
	onAddLanche,
	onRemoveLanche,
	totalCombos,
	error,
}: IComboSelectionSectionProps) => {
	return (
		<div className="card mb-3">
			<div className="card-header">
				<h6 className="mb-0">
					<i className="bi bi-bag me-2"></i>
					Selecionar Combos
				</h6>
			</div>
			<div className="card-body">
				{lanchesDisponiveis.length === 0 ? (
					<div className="alert alert-secondary mb-0">
						Nenhum combo disponível.
					</div>
				) : (
					<div className="row mb-3">
						{lanchesDisponiveis.map((lanche) => (
							<div key={lanche.id} className="col-md-6 mb-3">
								<div className="card h-100">
									<div className="card-body">
										<h6 className="card-title">{lanche.nome}</h6>
										<p className="card-text small text-muted">{lanche.descricao}</p>
										<p className="card-text">
											<strong>R$ {lanche.valorUnitario.toFixed(2)}</strong>
											<small className="text-muted ms-2">
												x{lanche.qtUnidade} =
												R$ {(lanche.valorUnitario * lanche.qtUnidade).toFixed(2)}
											</small>
										</p>
										<p className="card-text">
											<small
												className={(lanche.qtDisponivel ?? lanche.qtUnidade) <= 0 ? 'text-danger' : 'text-muted'}>
												Disponíveis: {lanche.qtDisponivel ?? lanche.qtUnidade}
											</small>
										</p>
										<Button
											type="button"
											label="Adicionar"
											variant="primary"
											size="sm"
											icon="bi bi-plus-circle"
											disabled={(lanche.qtDisponivel ?? lanche.qtUnidade) <= 0}
											onClick={() => onAddLanche({
												...lanche,
												qtUnidade: 1,
											})}
										/>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				<div className="mt-3">
					<h6>
						<i className="bi bi-check-circle me-2"></i>
						Combos Selecionados ({lanchesSelecionados.length})
					</h6>
					{lanchesSelecionados.length === 0 ? (
						<div className="alert alert-secondary">
							<small>Nenhum combo adicionado.</small>
						</div>
					) : (
						<ul className="list-group mb-3">
							{lanchesSelecionados.map((lanche, index) => (
								<li key={`lanche-${lanche.id}-${index}`}
									className="list-group-item d-flex justify-content-between align-items-center">
									<div>
										<strong>{lanche.nome}</strong> - {lanche.descricao}
										<br/>
										<small className="text-muted">
											R$ {lanche.valorUnitario.toFixed(2)} x {lanche.qtUnidade} =
											R$ {(lanche.valorUnitario * lanche.qtUnidade).toFixed(2)}
										</small>
									</div>
									<Button
										type="button"
										label=""
										variant="danger"
										size="sm"
										icon="bi bi-trash"
										onClick={() => onRemoveLanche(index)}
									/>
								</li>
							))}
						</ul>
					)}
					{lanchesSelecionados.length > 0 && (
						<div className="alert alert-info mb-0">
							<strong>Total dos combos:</strong> R$ {totalCombos.toFixed(2)}
						</div>
					)}
					{error && (
						<div className="alert alert-danger mt-2 mb-0">
							<i className="bi bi-exclamation-circle me-1"></i>
							{error}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
