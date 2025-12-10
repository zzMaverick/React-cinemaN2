interface IInputProps {
	id: string;
	name?: string;
	type?: 'text' | 'password' | 'email' | 'number' | 'checkbox' | 'radio';
	placeholder?: string;
	value?: string | number;
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
	hasError?: boolean;
}

const idCapitalized = (id: string) => id.charAt(0).toUpperCase() + id.slice(1);
export const Input = ({id, name, type = 'text', placeholder, value, onChange, hasError}: IInputProps) => {
	return (
		<>
			<label htmlFor={id} className="form-label">{idCapitalized(id)}</label>
			<input
				id={id}
				name={name ? name : id}
				className={`form-control ${hasError ? 'is-invalid' : ''}`}
				type={type}
				placeholder={placeholder}
				value={value ?? ''}
				onChange={onChange}
			/>
		</>
	)
}
