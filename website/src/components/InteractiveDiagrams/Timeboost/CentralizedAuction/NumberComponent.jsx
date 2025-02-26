import * as React from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useColorMode } from '@docusaurus/theme-common';
import ButtonComponent from './ButtonComponent';
import { CIRCLE_RADIUS, numberPaths, coordinates } from './constants';
import { NumberComponentProps } from './types';

export const NumberComponent = ({ number }) => {
  const { isDarkTheme } = useColorMode();

  const animationProps =
    number === 1 || number === 5
      ? { opacity: 1 }
      : useSpring({
          from: { opacity: 0.2 },
          to: [{ opacity: 1 }, { opacity: 0 }],
          config: { tension: 5200, friction: 8 },
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
        style={{ 
          ...animationProps, 
          fill: '#ff7f2a',
          stroke: isDarkTheme ? '#fff' : '#000',
          strokeWidth: '1px'
        }}
      />
      <path
        id={`path${number}`}
        d={pathData}
        style={{ 
          fill: isDarkTheme ? '#fff' : '#000'
        }}
        transform={`translate(${offsetX}, ${offsetY})`}
      />
    </g>
  );
};
