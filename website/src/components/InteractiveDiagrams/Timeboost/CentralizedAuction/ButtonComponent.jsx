import * as React from 'react';
import type { ButtonComponentProps } from './types';

const ButtonComponent: React.FC<ButtonComponentProps> = ({ x, y, width, height }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      x={x}
      y={y}
      width={width}
      height={height}
      viewBox="0 0 512 512"
    >
      <title>Interactive Button</title>
      <path
        d="M448,256c0-106-86-192-192-192S64,150,64,256s86,192,192,192S448,362,448,256Z"
        style={{fill: 'none', stroke: '#000000', strokeMiterlimit: 10, strokeWidth: '32px'}}
      />
      <circle
        cx="256"
        cy="256"
        r="144"
        style={{fill: '#ff7f2a'}}
      />
      <path
        d="M412.16 410.7v-3.06c2.5 0 3.66-.47 4.05-2.65h3.99v14.72h-4.35v-9.01h-3.68Z"
        style={{fill: '#ffffff'}}
        transform="scale(1.2) translate(-150, -150)"
      />
    </svg>
  );
};

export default ButtonComponent;
