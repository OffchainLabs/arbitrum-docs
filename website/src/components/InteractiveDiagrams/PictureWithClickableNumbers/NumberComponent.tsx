import * as React from 'react';
import { useSpring, animated as a } from '@react-spring/web';
import { useColorMode } from '@docusaurus/theme-common';
import '@site/src/css/custom.css';
import ButtonComponent from './ButtonComponent';
import { CIRCLE_RADIUS, numberPaths, coordinates as defaultCoordinates } from './constants';
import { NumberComponentProps } from './types';

/**
 * Number component for the PictureWithClickableNumbers diagram.
 *
 * @remarks
 * This component renders a numbered circle that represents a step in the diagram.
 * It includes animations for certain numbers and integrates with the ButtonComponent
 * for interactive elements.
 *
 * @param props - The component props
 * @param props.number - The step number (1-5) to display
 * @param props.animated - Whether the number should be animated (default: true for numbers 2, 3, 4)
 * @param props.interactive - Whether the number should be interactive (default: true for numbers 2, 3, 4)
 * @param props.coordinates - Optional custom coordinates to override the default positions
 * @returns An SVG element representing a numbered step in the diagram
 */
export const NumberComponent: React.FC<
  NumberComponentProps & {
    animated?: boolean;
    interactive?: boolean;
    coordinates?: typeof defaultCoordinates;
    id?: string;
  }
> = ({ number, animated, interactive, coordinates = defaultCoordinates, id = 'default' }) => {
  /**
   * Get the current color mode (light/dark) from Docusaurus.
   */
  const { isDarkTheme } = useColorMode();

  /**
   * Determine if the number should be animated based on props or default behavior
   */
  const shouldAnimate =
    animated !== undefined ? animated : number === 2 || number === 3 || number === 4;

  /**
   * Determine if the number should be interactive based on props or default behavior
   */
  const shouldBeInteractive =
    interactive !== undefined ? interactive : number === 2 || number === 3 || number === 4;

  /**
   * Animation configuration for the numbered circles.
   * By default, numbers 2, 3, and 4 have pulsing animations, while 1 and 5 remain static.
   */
  const animationProps = !shouldAnimate
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
      {/* Add interactive buttons based on shouldBeInteractive */}
      {shouldBeInteractive && (
        <ButtonComponent
          x={coords.circle.x - CIRCLE_RADIUS}
          y={coords.circle.y - CIRCLE_RADIUS}
          width={CIRCLE_RADIUS * 2}
          height={CIRCLE_RADIUS * 2}
        />
      )}
      {/* The circle background for the number */}
      {shouldAnimate ? (
        <a.circle
          id={`circle${number}`}
          cx={coords.circle.x}
          cy={coords.circle.y}
          r={CIRCLE_RADIUS}
          className={circleClassName}
          style={animationProps}
        />
      ) : (
        <circle
          id={`circle${number}`}
          cx={coords.circle.x}
          cy={coords.circle.y}
          r={CIRCLE_RADIUS}
          className={circleClassName}
          style={{ opacity: 1 }}
        />
      )}
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
