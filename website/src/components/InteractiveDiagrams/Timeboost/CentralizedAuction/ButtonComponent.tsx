import * as React from 'react';
import { ButtonComponentProps } from './types';

const ButtonComponent: React.FC<ButtonComponentProps> = ({ x, y, width, height }) => {
  const [isHovered, setIsHovered] = React.useState<boolean>(false);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x={x - width * 0.25}
      y={y - height * 0.25}
      width={width * 1.5}
      height={height * 1.5}
      viewBox="0 0 512 512"
      style={{
        cursor: 'pointer',
        transition: 'transform 0.2s',
        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <title>Interactive Button</title>
      <path
        d="M448,256c0-106-86-192-192-192S64,150,64,256s86,192,192,192S448,362,448,256Z"
        style={{
          fill: 'none',
          stroke: '#ffffff',
          strokeMiterlimit: 10,
          strokeWidth: '32px',
          filter: 'drop-shadow(0px 0px 4px rgba(255,255,255,0.5))',
        }}
      />
      <circle
        cx="256"
        cy="256"
        r="144"
        style={{
          fill: '#ff7f2a',
          filter: isHovered ? 'brightness(1.2)' : 'none',
          transition: 'filter 0.2s',
          animation: 'blink 2s ease-in-out infinite',
        }}
      />
    </svg>
  );
};

export default ButtonComponent;
