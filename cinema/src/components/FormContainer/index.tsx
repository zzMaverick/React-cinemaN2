import { ReactNode } from 'react';
import { Button } from '../Button';

interface IFormContainerProps {
	title: string;
	icon?: string;
	onSubmit: (e: React.FormEvent) => void;
	onCancel: () => void;
	children: ReactNode;
	isEditing?: boolean;
	isSubmitting?: boolean;
}

export const FormContainer = ({
	title,
	icon,
	onSubmit,
	onCancel,
	children,
	isEditing = false,
	isSubmitting = false,
}: IFormContainerProps) => {
	return (
		<div className="container mt-4">
			<div className="row justify-content-center">
				<div className="col-md-8">
					<h1 className="mb-4">
						{icon && <i className={`${icon} me-2`}></i>}
						{title}
					</h1>

					<form onSubmit={onSubmit} onKeyDown={(e) => {
						if (e.key === 'Enter' && e.target.nodeName !== 'TEXTAREA') {
							e.preventDefault();
						}
					}}>
						<div className="card">
							<div className="card-body">
								{children}
							</div>
							<div className="card-footer d-flex gap-2">
								<Button
									type="submit"
									label={isSubmitting ? 'Processando...' : isEditing ? 'Atualizar' : 'Cadastrar'}
									variant="primary"
									disabled={isSubmitting}
									icon={isEditing ? 'bi bi-pencil' : 'bi bi-plus'}
								/>
								<Button
									type="button"
									label="Cancelar"
									variant="secondary"
									onClick={onCancel}
									disabled={isSubmitting}
									icon="bi bi-x"
								/>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};
