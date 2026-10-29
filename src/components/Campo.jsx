import React, { useId } from 'react';

const Campo = ({ label, type = 'text', className = '', id: customId, name, required, ...inputProps }) => {
    const generatedId = useId();
    const fieldId = customId || name || generatedId;

    return (
        <div className={`form-group ${className}`}>
            {label && <label htmlFor={fieldId}>{label}</label>}
            <input 
                id={fieldId} 
                name={name} 
                type={type} 
                {...(required !== undefined ? { required } : {})}
                {...inputProps} 
            />
        </div>
    );
};

export default Campo;