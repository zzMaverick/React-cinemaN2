import { ReactNode } from 'react';

interface IFormFieldProps {
	error?: string;
	children: ReactNode;
}

export const FormField = ({ error, children }: IFormFieldProps) => {
	return (
		<div className="mb-3">
			{children}
			{error && (
				<div className="text-danger small mt-1">
					<i className="bi bi-exclamation-circle me-1"></i>
					{error}
				</div>
			)}
		</div>
	);
};
