// Campo de texto con su label vinculado (htmlFor/id) para que
// lectores de pantalla y Testing Library puedan encontrar el control.
import { useId } from 'react';

const Campo = ({ label, type = 'text', className, ...inputProps }) => {
    const id = useId();
    return (
        <div className={`form-group ${className}`}>
            <label htmlFor={id}>{label}</label>
            <input id={id} type={type} required {...inputProps} />
        </div>
    );
};

export default Campo;
