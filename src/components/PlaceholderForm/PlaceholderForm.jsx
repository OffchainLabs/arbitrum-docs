import React from 'react';
import './PlaceholderForm.css';


const PlaceholderForm = ({ id, inputs }) => {
    const inputList = inputs.split(',');

    return (
        <form id={id} className="placeholder-form">
            {inputList.map((inputName, index) => (
                <div key={index}>
                    <label htmlFor={`${id}-${inputName.trim()}`}>
                        {inputName.trim()}
                    </label>
                    <input disabled id={`${id}-${inputName.trim()}`} />
                </div>
            ))}
        </form>
    );
};

export { PlaceholderForm };
