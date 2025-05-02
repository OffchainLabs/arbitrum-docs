import * as React from 'react';
import { useSpring, animated as a } from '@react-spring/web';
import { useColorMode } from '@docusaurus/theme-common';
import '@site/src/css/custom.css';
import { numberPaths } from './constants';
import { NumberComponentProps } from './types';

/**
 * Button component for the PictureWithClickableNumbers diagram.
 *
 * @remarks
 * This component combines number display and interactive button functionality.
 * It renders a numbered element that can be either static or dynamic, with hover effects
 * for interactivity. Static buttons are just the number shape without a circle or interactivity.
 * Dynamic buttons have a circle background, animations, and can be clicked.
 *
 * @param props - The component props
 * @returns An SVG element representing an interactive numbered button in the diagram
 */
export const Button: React.FC<NumberComponentProps> = ({
  number,
  type = 'static',
  animated,
  interactive,
  coordinates,
  id = 'default',
  onHover,
}) => {
  /**
   * Get the current color mode (light/dark) from Docusaurus.
   */
  const { isDarkTheme } = useColorMode();

  /**
   * State to track whether the component is currently being hovered over.
   */
  const [isHovered, setIsHovered] = React.useState<boolean>(false);

  /**
   * Handle hover state changes
   */
  const handleHoverChange = (hoverState: boolean) => {
    setIsHovered(hoverState);
    if (onHover) {
      onHover(hoverState);
    }
  };

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

  // For dynamic numbers, we render the full interactive component with integrated button functionality
  return (
    <g
      id={`number${number}-${id}`}
      style={{
        cursor: shouldBeInteractive ? 'pointer' : 'default',
        pointerEvents: shouldBeInteractive ? 'all' : 'none',
      }}
    >
      {/* Invisible touch/hover area with button behavior */}
      {shouldBeInteractive && (
        <circle
          cx={coords.circle.x}
          cy={coords.circle.y}
          r={CIRCLE_RADIUS * 1.5}
          fill="transparent"
          style={{
            transition: 'transform 0.2s',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            transformOrigin: `${coords.circle.x}px ${coords.circle.y}px`,
            cursor: 'pointer',
          }}
          onMouseEnter={() => handleHoverChange(true)}
          onMouseLeave={() => handleHoverChange(false)}
        />
      )}

      {/* Visual button effect when hovered */}
      {shouldBeInteractive && isHovered && (
        <circle
          cx={coords.circle.x}
          cy={coords.circle.y}
          r={CIRCLE_RADIUS * 1.2}
          style={{
            fill: 'none',
            stroke: '#ffffff',
            strokeMiterlimit: 10,
            strokeWidth: '2px',
            filter: 'drop-shadow(0px 0px 4px rgba(255,255,255,0.5))',
          }}
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
          style={{
            ...animationProps,
            filter: isHovered && shouldBeInteractive ? 'brightness(1.2)' : 'none',
          }}
        />
      ) : (
        <circle
          id={`circle${number}-${id}`}
          cx={coords.circle.x}
          cy={coords.circle.y}
          r={CIRCLE_RADIUS}
          className={circleClassName}
          style={{
            opacity: 1,
            filter: isHovered && shouldBeInteractive ? 'brightness(1.2)' : 'none',
          }}
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

export default Button;
