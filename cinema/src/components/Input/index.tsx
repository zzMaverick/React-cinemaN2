interface IInputProps {
	id: string;
	name?: string;
	label?: string;
	type?: 'text' | 'password' | 'email' | 'number' | 'checkbox' | 'radio' | 'date' | 'textarea' | 'select';
	placeholder?: string;
	value?: string | number;
	onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
	hasError?: boolean;
	errorMessage?: string;
	disabled?: boolean;
	rows?: number;
	options?: { value: string | number; label: string }[];
}

const idCapitalized = (id: string) => id.charAt(0).toUpperCase() + id.slice(1);

export const Input = ({
	id,
	name,
	label,
	type = 'text',
	placeholder,
	value,
	onChange,
	hasError,
	errorMessage,
	disabled = false,
	rows = 4,
	options = [],
}: IInputProps) => {
	const displayLabel = label || idCapitalized(id);
	const inputName = name || id;

	if (type === 'textarea') {
		return (
			<>
				<label htmlFor={id} className="form-label">{displayLabel}</label>
				<textarea
					id={id}
					name={inputName}
					className={`form-control ${hasError ? 'is-invalid' : ''}`}
					placeholder={placeholder}
					value={value ?? ''}
					onChange={onChange}
					rows={rows}
					disabled={disabled}
				/>
				{hasError && errorMessage && (
					<div className="text-danger small mt-1">
						<i className="bi bi-exclamation-circle me-1"></i>
						{errorMessage}
					</div>
				)}
			</>
		);
	}

	if (type === 'select') {
		return (
			<>
				<label htmlFor={id} className="form-label">{displayLabel}</label>
				<select
					id={id}
					name={inputName}
					className={`form-select ${hasError ? 'is-invalid' : ''}`}
					value={value ?? ''}
					onChange={onChange}
					disabled={disabled}
				>
					<option value="">Selecione uma opção</option>
					{options.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
				{hasError && errorMessage && (
					<div className="text-danger small mt-1">
						<i className="bi bi-exclamation-circle me-1"></i>
						{errorMessage}
					</div>
				)}
			</>
		);
	}

	return (
		<>
			<label htmlFor={id} className="form-label">{displayLabel}</label>
			<input
				id={id}
				name={inputName}
				className={`form-control ${hasError ? 'is-invalid' : ''}`}
				type={type}
				placeholder={placeholder}
				value={value ?? ''}
				onChange={onChange}
				disabled={disabled}
			/>
			{hasError && errorMessage && (
				<div className="text-danger small mt-1">
					<i className="bi bi-exclamation-circle me-1"></i>
					{errorMessage}
				</div>
			)}
		</>
	);
};
