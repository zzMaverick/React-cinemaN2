import { Input } from '../Input';

interface ITicketQuantitySectionProps {
	quantidadeInteira: number;
	quantidadeMeia: number;
	onChangeInteira: (value: number) => void;
	onChangeMeia: (value: number) => void;
	errors: Record<string, string>;
}

export const TicketQuantitySection = ({
	quantidadeInteira,
	quantidadeMeia,
	onChangeInteira,
	onChangeMeia,
	errors,
}: ITicketQuantitySectionProps) => {
	const handleChangeInteira = (e: React.ChangeEvent<HTMLInputElement>) => {
		const num = Math.max(0, Number(e.target.value));
		onChangeInteira(num);
	};

	const handleChangeMeia = (e: React.ChangeEvent<HTMLInputElement>) => {
		const num = Math.max(0, Number(e.target.value));
		onChangeMeia(num);
	};

	return (
		<div className="card mb-3">
			<div className="card-header">
				<h6 className="mb-0">
					<i className="bi bi-ticket me-2"></i>
					Quantidade de Ingressos
				</h6>
			</div>
			<div className="card-body">
				<div className="row">
					<div className="col-md-6 mb-3">
						<Input
							id="quantidadeInteira"
							name="quantidadeInteira"
							label="Quantidade Inteira"
							type="number"
							value={quantidadeInteira}
							onChange={handleChangeInteira as any}
							hasError={!!errors.quantidadeInteira}
							errorMessage={errors.quantidadeInteira}
						/>
					</div>
					<div className="col-md-6 mb-3">
						<Input
							id="quantidadeMeia"
							name="quantidadeMeia"
							label="Quantidade Meia"
							type="number"
							value={quantidadeMeia}
							onChange={handleChangeMeia as any}
							hasError={!!errors.quantidadeMeia}
							errorMessage={errors.quantidadeMeia}
						/>
					</div>
				</div>
				{errors.quantidade && (
					<div className="alert alert-danger">
						<i className="bi bi-exclamation-circle me-1"></i>
						{errors.quantidade}
					</div>
				)}
			</div>
		</div>
	);
};
