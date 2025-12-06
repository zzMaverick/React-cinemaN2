interface IButtonProps {
    type?: 'button' | 'submit' | 'reset';
    label: string;
    variant?: 'primary' | 'secondary';
    onClick?: () => void;
}
export const Button = ({type = 'button',label,variant = 'primary', onClick }: IButtonProps
) => {
    return (
        <>
            <button className={"btn btn-"+variant} type={type} onClick={onClick}>{label}</button>
        </>
    );
}
