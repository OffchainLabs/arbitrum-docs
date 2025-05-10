import * as React from 'react';
import { useSpring, animated as a } from '@react-spring/web';
import { useColorMode } from '@docusaurus/theme-common';
import '@site/src/css/custom.css';
import ButtonComponent from './ButtonComponent';
import { numberPaths } from './constants';
import { NumberComponentProps } from './types';

/**
 * Number component for the PictureWithClickableNumbers diagram.
 *
 * @remarks
 * This component renders a numbered element that can be either static or dynamic.
 * Static numbers are just the number shape without a circle or interactivity.
 * Dynamic numbers have a circle background, animations, and can be clicked.
 *
 * @param props - The component props
 * @param props.number - The number (0-5) to display
 * @param props.type - The type of number component ('static' or 'dynamic')
 * @param props.animated - Whether the number should be animated (only applies to dynamic type)
 * @param props.interactive - Whether the number should be interactive (only applies to dynamic type)
 * @param props.coordinates - Coordinates for positioning the number
 * @param props.id - Unique identifier for this component
 * @returns An SVG element representing a number in the diagram
 */
export const NumberComponent: React.FC<
  NumberComponentProps & {
    animated?: boolean;
    interactive?: boolean;
    coordinates: Record<
      number,
      {
        circle: { x: number; y: number };
        path: { x: number; y: number };
        offset?: { x: number; y: number };
      }
    >;
    id?: string;
  }
> = ({ number, type = 'static', animated, interactive, coordinates, id = 'default' }) => {
  /**
   * Get the current color mode (light/dark) from Docusaurus.
   */
  const { isDarkTheme } = useColorMode();

  /**
   * Determine if the number should be animated based on props
   * Animation only applies to dynamic numbers
   */
  const shouldAnimate = type === 'dynamic' && (animated !== undefined ? animated : true);

  /**
   * Determine if the number should be interactive based on props
   * Interactivity only applies to dynamic numbers
   */
  const shouldBeInteractive =
    type === 'dynamic' && (interactive !== undefined ? interactive : true);

  /**
   * Animation configuration for the numbered circles.
   * Only applied to dynamic numbers.
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

  // Hard-coded circle radius value
  const CIRCLE_RADIUS = 20.95;

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

  // For static numbers, we only render the number path without a circle or interactivity
  if (type === 'static') {
    return (
      <g id={`number${number}-${id}`}>
        <path
          id={`path${number}-${id}`}
          d={pathData}
          className={pathClassName}
          transform={`translate(${offsetX}, ${offsetY})`}
        />
      </g>
    );
  }

  // For dynamic numbers, we render the full interactive component with circle and animations
  return (
    <g id={`number${number}-${id}`}>
      {/* Add interactive button for dynamic numbers */}
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
          id={`circle${number}-${id}`}
          cx={coords.circle.x}
          cy={coords.circle.y}
          r={CIRCLE_RADIUS}
          className={circleClassName}
          style={animationProps}
        />
      ) : (
        <circle
          id={`circle${number}-${id}`}
          cx={coords.circle.x}
          cy={coords.circle.y}
          r={CIRCLE_RADIUS}
          className={circleClassName}
          style={{ opacity: 1 }}
        />
      )}

      {/* The number path (SVG shape of the number) */}
      <path
        id={`path${number}-${id}`}
        d={pathData}
        className={pathClassName}
        transform={`translate(${offsetX}, ${offsetY})`}
      />
    </g>
  );
};
