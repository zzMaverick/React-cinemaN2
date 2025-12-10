interface IButtonProps {
    type?: 'button' | 'submit' | 'reset';
    label: string;
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info';
    onClick?: () => void;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    icon?: string;
    className?: string;
}

export const Button = ({
    type = 'button',
    label,
    variant = 'primary',
    onClick,
    disabled = false,
    size = 'md',
    icon,
    className = ''
}: IButtonProps) => {
    const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
    const btnClass = `btn btn-${variant} ${sizeClass} ${className}`.trim();

    return (
        <button
            className={btnClass}
            type={type}
            onClick={onClick}
            disabled={disabled}
        >
            {icon && <i className={`${icon} me-1`}></i>}
            {label}
        </button>
    );
};
