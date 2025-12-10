import { ReactNode } from 'react';
import { Button } from '../Button';

interface IModalProps {
	show: boolean;
	title: string;
	icon?: string;
	size?: 'sm' | 'md' | 'lg';
	onClose: () => void;
	onSubmit?: (e: React.FormEvent) => void;
	children: ReactNode;
	footer?: ReactNode;
	isSubmitting?: boolean;
}

export const Modal = ({
	show,
	title,
	icon,
	size = 'md',
	onClose,
	onSubmit,
	children,
	footer,
	isSubmitting = false,
}: IModalProps) => {
	if (!show) return null;

	const sizeClass = size === 'sm' ? 'modal-sm' : size === 'lg' ? 'modal-lg' : '';

	return (
		<div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
			<div className={`modal-dialog ${sizeClass}`}>
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title">
							{icon && <i className={`${icon} me-2`}></i>}
							{title}
						</h5>
						<button
							type="button"
							className="btn-close"
							onClick={onClose}
							disabled={isSubmitting}
						></button>
					</div>
					<form onSubmit={onSubmit} onKeyDown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
						}
					}}>
						<div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
							{children}
						</div>
						{footer && (
							<div className="modal-footer">
								{footer}
							</div>
						)}
					</form>
				</div>
			</div>
		</div>
	);
};
