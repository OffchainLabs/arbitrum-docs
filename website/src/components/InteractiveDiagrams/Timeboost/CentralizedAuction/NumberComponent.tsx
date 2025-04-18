import * as React from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useColorMode } from '@docusaurus/theme-common';
import '@site/src/css/custom.css';
import ButtonComponent from './ButtonComponent';
import { CIRCLE_RADIUS, numberPaths, coordinates } from './constants';
import { NumberComponentProps } from './types';

export const NumberComponent: React.FC<NumberComponentProps> = ({ number }) => {
  const { isDarkTheme } = useColorMode();

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

  const coords = coordinates[number];
  const pathData = numberPaths[number];

  if (!coords || !pathData) {
    return null;
  }

  const offsetX = coords.circle.x - coords.path.x + (coords.offset?.x || 0);
  const offsetY = coords.circle.y - coords.path.y + (coords.offset?.y || 0);

  const circleClassName = isDarkTheme ? 'cls-5' : 'cls-5-light';
  const pathClassName = isDarkTheme ? 'cls-10' : 'cls-10-light';

  return (
    <g id={`number${number}`}>
      {(number === 2 || number === 3 || number === 4) && (
        <ButtonComponent
          x={coords.circle.x - CIRCLE_RADIUS}
          y={coords.circle.y - CIRCLE_RADIUS}
          width={CIRCLE_RADIUS * 2}
          height={CIRCLE_RADIUS * 2}
        />
      )}
      <animated.circle
        id={`circle${number}`}
        cx={coords.circle.x}
        cy={coords.circle.y}
        r={CIRCLE_RADIUS}
        className={circleClassName}
        style={{ ...animationProps }}
      />
      <path
        id={`path${number}`}
        d={pathData}
        className={pathClassName}
        transform={`translate(${offsetX}, ${offsetY})`}
      />
    </g>
  );
};
