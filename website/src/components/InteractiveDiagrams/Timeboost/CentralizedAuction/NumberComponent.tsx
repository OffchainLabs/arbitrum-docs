import * as React from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useColorMode } from '@docusaurus/theme-common';
import '@site/src/css/custom.css';
import ButtonComponent from './ButtonComponent';
import { CIRCLE_RADIUS, numberPaths, coordinates } from './constants';
import { NumberComponentProps } from './types';

/**
 * Number component for the CentralizedAuction diagram.
 *
 * @remarks
 * This component renders a numbered circle that represents a step in the diagram.
 * It includes animations for certain numbers and integrates with the ButtonComponent
 * for interactive elements.
 *
 * @param props - The component props
 * @param props.number - The step number (1-5) to display
 * @returns An SVG element representing a numbered step in the diagram
 */
export const NumberComponent: React.FC<NumberComponentProps> = ({ number }) => {
  /**
   * Get the current color mode (light/dark) from Docusaurus.
   */
  const { isDarkTheme } = useColorMode();

  /**
   * Animation configuration for the numbered circles.
   * Numbers 2, 3, and 4 have pulsing animations, while 1 and 5 remain static.
   */
  const animationProps =
    number === 1 || number === 5
      ? { opacity: 1 }
      : useSpring({
          from: { opacity: 0, fill: '#ff7f2a' },
          to: [
            { opacity: 1, fill: '#ff7f2a' },
            { opacity: 1, fill: '#3578e5' },
            { opacity: 0, fill: '#3578e5' },
          ],
          config: { tension: 20000, friction: 10 },
          loop: true,
          reset: true,
          immediate: false,
        });

  /**
   * Get the coordinates and path data for the current number.
   */
  const coords = coordinates[number];
  const pathData = numberPaths[number];

  if (!coords || !pathData) {
    return null;
  }

  /**
   * Calculate the offset for proper positioning of the number path within the circle.
   */
  const offsetX = coords.circle.x - coords.path.x + (coords.offset?.x || 0);
  const offsetY = coords.circle.y - coords.path.y + (coords.offset?.y || 0);

  /**
   * Determine the appropriate CSS classes based on the current theme.
   */
  const circleClassName = isDarkTheme ? 'cls-5' : 'cls-5-light';
  const pathClassName = isDarkTheme ? 'cls-10' : 'cls-10-light';

  return (
    <g id={`number${number}`}>
      {/* Only add interactive buttons to numbers 2, 3, and 4 */}
      {(number === 2 || number === 3 || number === 4) && (
        <ButtonComponent
          x={coords.circle.x - CIRCLE_RADIUS}
          y={coords.circle.y - CIRCLE_RADIUS}
          width={CIRCLE_RADIUS * 2}
          height={CIRCLE_RADIUS * 2}
        />
      )}
      {/* The circle background for the number */}
      <animated.circle
        id={`circle${number}`}
        cx={coords.circle.x}
        cy={coords.circle.y}
        r={CIRCLE_RADIUS}
        className={circleClassName}
        style={{ ...animationProps }}
      />
      {/* The number path (SVG shape of the number) */}
      <path
        id={`path${number}`}
        d={pathData}
        className={pathClassName}
        transform={`translate(${offsetX}, ${offsetY})`}
      />
    </g>
  );
};
