import * as React from 'react';
import { ButtonComponentProps } from './types';

/**
 * Interactive button component for the CentralizedAuction diagram.
 * 
 * @remarks
 * This component renders an interactive SVG button that responds to hover events.
 * It's used within the NumberComponent to make certain numbers clickable.
 * 
 * @param props - The component props
 * @param props.x - The x-coordinate position of the button
 * @param props.y - The y-coordinate position of the button
 * @param props.width - The width of the button
 * @param props.height - The height of the button
 * @returns An SVG element representing an interactive button
 */
const ButtonComponent: React.FC<ButtonComponentProps> = ({ x, y, width, height }) => {
  /**
   * State to track whether the button is currently being hovered over.
   */
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
